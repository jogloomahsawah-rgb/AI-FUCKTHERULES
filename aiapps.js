// Aplikasi di dalam HP AI OFFICE (khusus admin): Chat, Ringkasan, Karyawan, Persetujuan, Draf, Laporan, Rutin, Setelan.
// Semua data lewat Worker (api). Angka di Ringkasan/Karyawan dihitung kode, bukan AI.
import { A, api, adminLogout, WORKER_OK } from './aichat.js?v=2';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ago = iso => { const t = Date.parse(iso); if (!t) return '-'; const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'baru saja' : m < 60 ? m + ' mnt lalu' : m < 1440 ? Math.round(m / 60) + ' jam lalu' : Math.round(m / 1440) + ' hari lalu'; };
const load = el => { el.innerHTML = '<div class="ai-muted">Memuat…</div>'; };
const fail = (el, x) => { el.innerHTML = `<div class="ai-card bad"><b>Belum bisa dimuat</b><br>${esc(x.message || x)}<br><button class="ai-btn" data-retry>Coba lagi</button></div>`; };
const copy = async (btn, t) => { try { await navigator.clipboard.writeText(t); btn.textContent = 'Tersalin ✓'; } catch { btn.textContent = 'Gagal menyalin'; } };
const confirm2 = (btn, run, label = 'Yakin?') => { if (btn.dataset.arm) return run(); btn.dataset.arm = 1; const o = btn.textContent; btn.textContent = label; btn.classList.add('arm'); setTimeout(() => { delete btn.dataset.arm; btn.textContent = o; btn.classList.remove('arm'); }, 4000); };
const guard = (el, f) => async () => { try { await f(); } catch (x) { fail(el, x); } };

/* ---------------- Chat: beri tugas ke agen ---------------- */
const KEY = 'ftr_ai_chat'; let hist = []; try { hist = JSON.parse(localStorage.getItem(KEY) || '[]').slice(-30); } catch { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(hist.slice(-30))); } catch { } };
const CHIPS = [['Ringkas order', 'Ringkas order: jumlah per status dan yang belum lunas.'], ['Cek stok', 'Cek stok: varian mana yang menipis dan perlu restok?'], ['Cek pengiriman', 'Ringkas kondisi pengiriman dan pelacakan.'], ['Ide konten', 'Buat 1 ide konten Instagram hari ini lalu simpan sebagai draf.'], ['Kondisi sistem', 'Cek situs dan database, lalu ringkas laporan agen terbaru.']];
export function chat(el, ctx) {
  el.innerHTML = `<div class="ai-chips">${CHIPS.map(([n], i) => `<button data-c="${i}">${n}</button>`).join('')}</div><div class="ai-msgs" id="aiM"></div>
  <form class="ai-form" id="aiF"><input id="aiQ" placeholder="Beri tugas atau tanya…" autocomplete="off"><button class="ai-send">Kirim</button></form>`;
  const M = el.querySelector('#aiM'), bub = (t, me, extra = '') => { M.insertAdjacentHTML('beforeend', `<div class="ai-b ${me ? 'me' : ''}">${esc(t)}${extra}</div>`); M.scrollTop = 1e9; return M.lastChild; };
  if (!WORKER_OK) return bub('URL Worker belum diisi di config.js.');
  if (!hist.length) bub('Halo admin. Beri aku tugas: cek order, stok, pengiriman, bikin draf konten, atau jadwalkan tugas rutin. Aku ambil data nyata lewat tool; perubahan penting selalu minta persetujuanmu.');
  hist.forEach(m => bub(m.text, m.role === 'user', m.extra || ''));
  let busy = false;
  const send = async t => {
    if (!t || busy) return; busy = true; hist.push({ role: 'user', text: t }); bub(t, true); const w = bub('Mengerjakan…'); w.classList.add('wait');
    try {
      const j = await api('/chat', { messages: hist.map(({ role, text }) => ({ role, text })) }), c = j.cek, steps = [...new Set((j.log || []).filter(x => /^\w+:\w+$/.test(x)).map(x => x.split(':')[1]))];
      const extra = (steps.length ? `<div class="ai-steps">Langkah agen: ${steps.map(esc).join(' → ')}</div>` : '') + (c ? `<div class="ai-steps">${esc(c.maker)}${c.checker ? ' → dicek ' + esc(c.checker) + ': ' + esc(c.verdict) : ' · ' + esc(c.verdict)}</div>` : '') + (steps.includes('ajukan_aksi') ? '<button class="ai-btn" data-go="persetujuan">Buka Persetujuan</button>' : '');
      w.remove(); const reply = j.reply || 'Tidak ada jawaban.'; hist.push({ role: 'model', text: reply, extra }); bub(reply, false, extra);
    } catch (x) { w.remove(); hist.pop(); bub('Gagal: ' + x.message + (x.log?.length ? '\n\nDetail:\n- ' + x.log.join('\n- ') : '')); }
    save(); busy = false;
  };
  el.querySelector('#aiF').onsubmit = e => { e.preventDefault(); const q = el.querySelector('#aiQ'), t = q.value.trim(); q.value = ''; send(t); };
  el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.c) send(CHIPS[+b.dataset.c][1]); if (b.dataset.go) ctx.go(b.dataset.go); });
  if (ctx.kirim) send(ctx.kirim);
}

/* ---------------- Ringkasan ---------------- */
export async function ringkasan(el, ctx) {
  load(el); const d = await api('/ringkasan'), o = d.order, an = d.anggaran_ai, kpi = (n, l, go) => `<button class="ai-kpi" ${go ? `data-go="${go}"` : ''}><b>${n ?? '-'}</b><span>${l}</span></button>`;
  el.innerHTML = `<div class="ai-grid">${kpi(o?.total, 'Order', '')}${kpi(o?.belum_lunas, 'Belum lunas', '')}${kpi(d.stok?.perlu_restok, 'Perlu restok', '')}${kpi(d.persetujuan?.pending, 'Menunggu setuju', 'persetujuan')}${kpi(d.draf?.belum_diposting + d.draf?.siap_upload || 0, 'Draf belum posting', 'draf')}${kpi(d.agen.perhatian, 'Agen perlu cek', 'karyawan')}</div>
  ${o ? `<div class="ai-card"><b>Order per status</b><div class="ai-row">${Object.entries(o.per_status).map(([k, v]) => `<span class="ai-pill">${esc(k)} ${v.jumlah}</span>`).join('') || '-'}</div></div>` : ''}
  ${d.stok?.daftar.length ? `<div class="ai-card"><b>Stok menipis (≤ ${d.stok.batas})</b>${d.stok.daftar.map(p => `<div class="ai-li">${esc(p.produk)}<small>${esc(p.menipis.join(', '))}</small></div>`).join('')}</div>` : ''}
  ${d.perhatian.length ? `<div class="ai-card bad"><b>Perlu perhatian</b>${d.perhatian.map(p => `<div class="ai-li">${esc(p.agen)}: ${esc(p.label)}<small>${ago(p.waktu)}</small></div>`).join('')}</div>` : ''}
  ${d.laporan_terakhir ? `<div class="ai-card"><b>Laporan terakhir</b> <small>${ago(d.laporan_terakhir.waktu)}</small><div class="ai-pre">${esc(d.laporan_terakhir.teks)}</div></div>` : ''}
  ${an ? `<div class="ai-card"><b>Anggaran AI hari ini</b> <small>${an.terpakai}/${an.batas} panggilan (perkiraan)</small><div class="ai-meter"><i style="width:${Math.min(100, an.terpakai / an.batas * 100)}%"></i></div></div>` : ''}
  ${d.gagal ? `<div class="ai-card bad"><b>Sebagian data gagal dibaca</b><br><small>${esc(d.gagal.join(' | '))}</small></div>` : ''}
  <button class="ai-btn pri" data-ask>Minta saran AI dari ringkasan ini</button>`;
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.go) ctx.go(b.dataset.go); if (b.dataset.ask) ctx.go('chat', { kirim: 'Dari kondisi order, stok, pengiriman, dan laporan agen saat ini, apa 3 hal paling penting yang harus aku kerjakan hari ini?' }); if (b.dataset.retry) ctx.refresh(); };
}

/* ---------------- Karyawan (agen) ---------------- */
export async function karyawan(el, ctx) {
  load(el); const d = await api('/agen'), col = { kerja: 'on', selesai: 'ok', santai: '' }; let open = '';
  const draw = () => {
    el.innerHTML = d.agents.map(a => `<div class="ai-card ${a.flag || a.ok === false ? 'bad' : ''}"><div class="ai-h"><b>${esc(a.emoji)} ${esc(a.role)}</b><span class="ai-st ${col[a.mode]}">${a.mode === 'kerja' ? 'BEKERJA' : a.mode === 'selesai' ? 'SELESAI' : 'STANDBY'}</span></div>
      <div>${esc(a.tugas)}</div><small>Terakhir: ${a.lastAt ? esc(a.label || '-') + ' · ' + ago(a.lastAt) : 'belum pernah jalan'} · hari ini ${a.n}× · jam ${esc(a.jam)} · berikut ${esc(a.berikut)} · ${a.ai ? 'pakai AI' : 'tanpa AI'}${a.ok === false ? ' · GAGAL' : ''}${a.flag ? ' · ⚠ perlu perhatian' : ''}</small>
      ${a.mode === 'santai' ? `<small class="mute">Standby: ${esc(a.aktivitas)} (hiburan kantor, bukan pekerjaan nyata)</small>` : ''}
      <div class="ai-row"><button class="ai-btn" data-o="${esc(a.role)}">${open === a.role ? 'Tutup riwayat' : 'Riwayat (' + a.riwayat.length + ')'}</button><button class="ai-btn" data-run="${esc(a.role)}">Jalankan sekarang</button></div>
      ${open === a.role ? (a.riwayat.length ? a.riwayat.map(r => `<div class="ai-li ${r.flag ? 'bad' : ''}"><b>${esc(r.label)}</b> <small>${ago(r.waktu)}</small><div class="ai-pre">${esc(r.hasil) || '-'}</div></div>`).join('') : '<small class="mute">Belum ada hasil tercatat.</small>') : ''}</div>`).join('')
      + `<div class="ai-card"><b>Tugas dari chat & rutin</b>${d.tugas.length ? d.tugas.map(t => `<div class="ai-li ${t.flag ? 'bad' : ''}">${esc(t.agent === 'CHAT' ? '💬' : '🔁')} ${esc(t.label)} <small>${ago(t.waktu)}</small>${t.langkah ? `<small>Langkah: ${esc(t.langkah)}</small>` : ''}<div class="ai-pre">${esc(t.hasil).slice(0, 300)}</div></div>`).join('') : '<small class="mute">Belum ada.</small>'}</div>
      <small class="mute">Anggaran AI: ${d.anggaran_ai.terpakai}/${d.anggaran_ai.batas} (perkiraan). Tugas terjadwal berhenti memakai AI saat batas tercapai; chat tetap jalan.</small>`;
  };
  draw();
  el.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.o !== undefined) { open = open === b.dataset.o ? '' : b.dataset.o; return draw(); }
    if (b.dataset.retry) return ctx.refresh();
    if (b.dataset.run) { b.disabled = true; b.textContent = 'Berjalan…'; try { const r = await api('/agen/jalankan', { role: b.dataset.run }); b.textContent = r.skip ? 'Tidak ada perubahan' : r.ok ? 'Selesai ✓' : 'Gagal'; setTimeout(ctx.refresh, 1200); } catch (x) { b.textContent = x.message.slice(0, 40); } }
  };
}

/* ---------------- Persetujuan ---------------- */
const ST = { pending: 'Menunggu', dijalankan: 'Dijalankan', disetujui_manual: 'Disetujui · kerjakan manual', ditolak: 'Ditolak', gagal: 'Gagal', approved: 'Disetujui', rejected: 'Ditolak' };
export async function persetujuan(el, ctx) {
  load(el); const d = await api('/persetujuan'), tab = ctx.tab || 'pending', L = d.items.filter(x => (x.status === 'pending') === (tab === 'pending'));
  el.innerHTML = `<div class="ai-chips"><button class="${tab === 'pending' ? 'on' : ''}" data-t="pending">Menunggu (${d.pending})</button><button class="${tab === 'riwayat' ? 'on' : ''}" data-t="riwayat">Riwayat</button></div>`
    + (L.length ? L.map(x => `<div class="ai-card"><div class="ai-h"><b>${esc(x.aksi)}</b><span class="ai-st ${x.status === 'dijalankan' ? 'ok' : x.status === 'gagal' || x.status === 'ditolak' || x.status === 'rejected' ? 'no' : ''}">${esc(ST[x.status] || x.status)}</span></div>
      <div class="ai-pre">${esc(x.detail)}</div>${x.alasan ? `<small>Alasan: ${esc(x.alasan)}</small>` : ''}<small class="mute">${x.otomatis ? 'Setelah disetujui, sistem menjalankannya.' : 'Perubahan toko/posting: sistem hanya mencatat, kamu yang mengerjakan.'} · ${ago(x.waktu)}</small>
      ${x.hasil ? `<div class="ai-li"><small>Hasil: ${esc(x.hasil)}</small></div>` : ''}
      ${x.status === 'pending' ? `<div class="ai-row"><button class="ai-btn pri" data-d="setuju" data-id="${esc(x.id)}">Setujui</button><button class="ai-btn" data-d="tolak" data-id="${esc(x.id)}">Tolak</button></div>` : ''}</div>`).join('') : '<div class="ai-empty"><b>Kosong</b>Belum ada persetujuan di sini.</div>');
  el.onclick = e => {
    const b = e.target.closest('button'); if (!b) return; if (b.dataset.t) { ctx.tab = b.dataset.t; return ctx.refresh(); } if (b.dataset.retry) return ctx.refresh();
    if (b.dataset.d) confirm2(b, async () => { b.disabled = true; try { await api('/persetujuan/putuskan', { id: b.dataset.id, keputusan: b.dataset.d }); } catch (x) { alert(x.message); } ctx.refresh(); }, b.dataset.d === 'setuju' ? 'Ya, setujui' : 'Ya, tolak');
  };
}

/* ---------------- Draf ---------------- */
export async function draf(el, ctx) {
  load(el); const d = await api('/draf'), f = ctx.f || 'all', F = [['all', 'Semua'], ['siap_upload', 'Siap upload'], ['konten', 'Konten harian'], ['lain', 'Lainnya']];
  const L = d.items.filter(x => f === 'all' || (f === 'lain' ? !['konten', 'siap_upload'].includes(x.jenis) : x.jenis === f));
  el.innerHTML = `<div class="ai-chips">${F.map(([k, n]) => `<button class="${f === k ? 'on' : ''}" data-f="${k}">${n}</button>`).join('')}</div>`
    + (L.length ? L.map(x => `<div class="ai-card"><div class="ai-h"><b>${esc(x.judul || x.jenis)}</b><span class="ai-st ${x.diposting ? 'ok' : ''}">${x.diposting ? 'DIPOSTING' : esc(String(x.status || x.jenis).toUpperCase())}</span></div><small>${esc(x.jenis)} · ${ago(x.waktu)}</small><div class="ai-pre ai-clip" data-p>${esc(x.isi)}</div>
      <div class="ai-row"><button class="ai-btn" data-more>Buka penuh</button><button class="ai-btn" data-cp="${esc(x.id)}">Salin</button><button class="ai-btn" data-post="${esc(x.id)}" data-v="${x.diposting ? '' : 1}">${x.diposting ? 'Batal tandai' : 'Tandai diposting'}</button></div></div>`).join('') : '<div class="ai-empty"><b>Belum ada draf</b>Minta di Chat atau tunggu agen konten jam 09:00–10:00 WIB.</div>');
  el.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return; if (b.dataset.retry) return ctx.refresh(); if (b.dataset.f) { ctx.f = b.dataset.f; return ctx.refresh(); }
    if (b.dataset.more !== undefined) { const p = b.closest('.ai-card').querySelector('[data-p]'); p.classList.toggle('ai-clip'); b.textContent = p.classList.contains('ai-clip') ? 'Buka penuh' : 'Ciutkan'; }
    if (b.dataset.cp) copy(b, d.items.find(x => x.id === b.dataset.cp)?.isi || '');
    if (b.dataset.post) { b.disabled = true; try { await api('/draf/status', { id: b.dataset.post, diposting: !!b.dataset.v }); } catch (x) { alert(x.message); } ctx.refresh(); }
  };
}

/* ---------------- Laporan ---------------- */
export async function laporan(el, ctx) {
  load(el); const d = await api('/laporan');
  el.innerHTML = `<button class="ai-btn pri" data-new>Buat laporan sekarang (pakai AI)</button><div id="aiMsg" class="ai-muted"></div>
  ${d.perhatian.length ? `<div class="ai-card bad"><b>Perlu perhatian</b>${d.perhatian.map(p => `<div class="ai-li"><b>${esc(p.agent)}</b>: ${esc(p.label)} <small>${ago(p.waktu)}</small><div class="ai-pre">${esc(p.hasil).slice(0, 300)}</div></div>`).join('')}</div>` : ''}
  ${d.laporan.length ? d.laporan.map(r => `<div class="ai-card"><b>${esc(r.label)}</b> <small>${ago(r.waktu)} · ${esc(new Date(r.waktu).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</small><div class="ai-pre">${esc(r.hasil)}</div><div class="ai-row"><button class="ai-btn" data-cp="${esc(r.waktu)}">Salin</button></div></div>`).join('') : '<div class="ai-empty"><b>Belum ada laporan</b>Laporan otomatis jam 08:00 dan 20:00 WIB, atau buat sekarang.</div>'}`;
  el.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return; if (b.dataset.retry) return ctx.refresh();
    if (b.dataset.cp) copy(b, d.laporan.find(r => r.waktu === b.dataset.cp)?.hasil || '');
    if (b.dataset.new !== undefined) { b.disabled = true; b.textContent = 'AI sedang menulis…'; try { const r = await api('/laporan/buat', {}); if (r.ok) return ctx.refresh(); el.querySelector('#aiMsg').textContent = r.label; } catch (x) { el.querySelector('#aiMsg').textContent = x.message; } b.disabled = false; b.textContent = 'Buat laporan sekarang (pakai AI)'; }
  };
}

/* ---------------- Rutin: tugas berulang buatan admin ---------------- */
export async function rutin(el, ctx) {
  load(el); const d = await api('/rutin');
  el.innerHTML = `<div class="ai-card"><b>Tugas rutin</b><br><small>Agen mengerjakan perintahmu otomatis tiap hari di jam pilihan (WIB). Maks ${d.maks}. Tiap rutin memakai ±1–4 panggilan AI per hari.</small></div>
  ${d.rutin.map(r => `<div class="ai-card ${r.aktif === false ? 'dim' : ''}"><div class="ai-h"><b>Jam ${String(r.jam).padStart(2, '0')}:00</b><span class="ai-st ${r.aktif === false ? '' : 'ok'}">${r.aktif === false ? 'DIJEDA' : 'AKTIF'}</span></div><div class="ai-pre">${esc(r.perintah)}</div><small>Terakhir jalan: ${esc(r.lastHari || 'belum')}</small>
    <div class="ai-row"><button class="ai-btn" data-a="${r.aktif === false ? 'lanjut' : 'jeda'}" data-id="${esc(r.id)}">${r.aktif === false ? 'Lanjutkan' : 'Jeda'}</button><button class="ai-btn" data-a="jalankan" data-id="${esc(r.id)}">Jalankan sekarang</button><button class="ai-btn" data-a="hapus" data-id="${esc(r.id)}">Hapus</button></div><div class="ai-muted" data-out></div></div>`).join('')}
  ${d.rutin.length < d.maks ? `<div class="ai-card"><b>Tambah tugas rutin</b><textarea id="rP" rows="3" maxlength="400" placeholder="mis. Cek stok menipis dan ringkas order belum lunas"></textarea><div class="ai-row"><select id="rJ">${Array.from({ length: 24 }, (_, i) => `<option value="${i}"${i === 7 ? ' selected' : ''}>${String(i).padStart(2, '0')}:00 WIB</option>`).join('')}</select><button class="ai-btn pri" data-add>Tambah</button></div><div id="rM" class="ai-muted"></div></div>` : ''}`;
  el.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return; if (b.dataset.retry) return ctx.refresh();
    if (b.dataset.add !== undefined) { try { await api('/rutin', { aksi: 'buat', perintah: el.querySelector('#rP').value, jam: +el.querySelector('#rJ').value }); ctx.refresh(); } catch (x) { el.querySelector('#rM').textContent = x.message; } return; }
    const a = b.dataset.a; if (!a) return;
    const run = async () => { b.disabled = true; const out = b.closest('.ai-card').querySelector('[data-out]'); if (a === 'jalankan') out.textContent = 'Agen bekerja (bisa 10–30 detik)…'; try { const r = await api('/rutin', { aksi: a, id: b.dataset.id }); if (a === 'jalankan') { out.textContent = r.hasil || 'Selesai.'; b.disabled = false; return; } ctx.refresh(); } catch (x) { out.textContent = x.message; b.disabled = false; } };
    a === 'hapus' ? confirm2(b, run, 'Yakin hapus?') : run();
  };
}

/* ---------------- Setelan: konten harian, koneksi, memori, akun ---------------- */
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export async function setelan(el, ctx) {
  load(el); let d = await api('/settings'), mem = []; try { mem = (await api('/memori')).catatan; } catch { }
  const c = d.settings, T = d.tema, i = A.info || {}, opts = sel => Object.entries(T).map(([k, n]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(n)}</option>`).join('');
  const draw = () => {
    el.innerHTML = `<div class="ai-card"><b>Koneksi</b><div class="ai-row">${['gemini', 'groq', 'cfai'].map(k => `<span class="ai-pill ${i.penyedia?.[k] ? 'ok' : 'no'}">${k === 'cfai' ? 'Workers AI' : k} ${i.penyedia?.[k] ? '✓' : '✗'}</span>`).join('')}<span class="ai-pill ${i.sa ? 'ok' : 'no'}">Service account ${i.sa ? '✓' : '✗'}</span></div><small>${esc(A.user?.email || '')}${i.sa ? '' : ' · FIREBASE_SA belum diisi: monitoring dan tugas rutin tidak jalan.'}</small></div>
    <div class="ai-card"><b>Hari ini</b><br>Tema: <b>${esc(d.hariIni.label)}</b> (${d.hariIni.urutan}/${d.hariIni.dari}) · mode <b>${esc(c.mode)}</b><br><small>Satu ide + caption matang per hari. Posting tetap manual (auto-post Instagram belum ada).</small></div>
    <div class="ai-card"><b>Mode konten</b><div class="ai-row"><button class="ai-btn ${c.mode === 'otomatis' ? 'pri' : ''}" data-m="otomatis">Otomatis</button><button class="ai-btn ${c.mode === 'manual' ? 'pri' : ''}" data-m="manual">Manual</button></div></div>
    <div class="ai-card"><b>Upload per minggu</b> <select id="sPm">${[0, 1, 2, 3].map(n => `<option${n === c.perMinggu ? ' selected' : ''}>${n}</option>`).join('')}</select><div class="ai-row">${HARI.map((h, k) => `<button class="ai-btn ${c.hariUpload.includes(k) ? 'pri' : ''}" data-h="${k}">${h}</button>`).join('')}</div></div>
    <div class="ai-card"><b>Rotasi tema harian</b>${c.rotasi.map((t, k) => `<div class="ai-row"><select data-r="${k}">${opts(t)}</select><button class="ai-btn" data-x="${k}">×</button></div>`).join('')}${c.rotasi.length < 7 ? '<button class="ai-btn" data-add>+ Tambah hari</button>' : ''}</div>
    <div class="ai-card"><b>Catatan brand</b><textarea id="sBr" rows="3" maxlength="1500">${esc(c.catatanBrand)}</textarea><b>Momen & tren terkini</b><textarea id="sMo" rows="2" maxlength="600">${esc(c.momen || '')}</textarea><b>Produk selanjutnya</b><input id="sPn" maxlength="80" placeholder="Nama / kode" value="${esc(c.produkNext.nama)}"><textarea id="sPc" rows="3" maxlength="600" placeholder="Konsep, warna, rencana rilis…">${esc(c.produkNext.catatan)}</textarea></div>
    <button class="ai-btn pri" data-save>Simpan setelan</button><div id="sMsg" class="ai-muted"></div>
    <div class="ai-card"><b>Buat konten sekarang</b> <small>(manual, maks 10 aksi AI/hari)</small><div class="ai-row"><select id="sTm">${opts(d.hariIni.tema)}</select><button class="ai-btn pri" data-gen>Buat</button></div><div id="sGen" class="ai-pre"></div></div>
    <div class="ai-card"><b>Memori agen</b> <small>(${mem.length}/20 catatan yang agen simpan sendiri)</small>${mem.length ? mem.map((m, k) => `<div class="ai-li">${esc(m.teks)} <small>${esc(m.t || '')}</small> <button class="ai-btn" data-dm="${k}">Hapus</button></div>`).join('') : '<br><small class="mute">Kosong. Agen mencatat preferensimu saat kamu memintanya mengingat sesuatu.</small>'}</div>
    <div class="ai-card"><b>Akun</b><div class="ai-row"><button class="ai-btn" data-out>Keluar</button></div></div>`;
  };
  const grab = () => { c.catatanBrand = el.querySelector('#sBr').value; c.momen = el.querySelector('#sMo').value; c.produkNext = { nama: el.querySelector('#sPn').value, catatan: el.querySelector('#sPc').value }; c.perMinggu = +el.querySelector('#sPm').value; c.hariUpload = c.hariUpload.slice(0, c.perMinggu); };
  const msg = (t, bad) => { const m = el.querySelector('#sMsg'); m.style.color = bad ? '#b3261e' : '#16a34a'; m.textContent = t; };
  draw();
  el.onchange = e => { if (e.target.id === 'sPm') { grab(); draw(); } if (e.target.dataset.r !== undefined) c.rotasi[+e.target.dataset.r] = e.target.value; };
  el.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return; const D = b.dataset;
    if (D.retry) return ctx.refresh(); if (D.out !== undefined) return adminLogout();
    if (D.m) { grab(); c.mode = D.m; draw(); } else if (D.h) { grab(); const h = +D.h, k = c.hariUpload.indexOf(h); if (k >= 0) c.hariUpload.splice(k, 1); else if (c.hariUpload.length < c.perMinggu) c.hariUpload.push(h); draw(); }
    else if (D.x) { grab(); if (c.rotasi.length > 1) c.rotasi.splice(+D.x, 1); draw(); } else if (D.add !== undefined) { grab(); c.rotasi.push('instagram'); draw(); }
    else if (D.save !== undefined) { grab(); msg('Menyimpan…'); try { const r = await api('/settings', c); d = r; Object.assign(c, r.settings); msg('Tersimpan.'); } catch (x) { msg('Gagal: ' + x.message, true); } }
    else if (D.gen !== undefined) { const g = el.querySelector('#sGen'); b.disabled = true; g.textContent = 'AI sedang menulis (10–30 detik)…'; try { const r = await api('/konten/buat', { tema: el.querySelector('#sTm').value }); g.textContent = r.tema + ' — tersimpan di Draf.\n\n' + r.isi; } catch (x) { g.textContent = 'Gagal: ' + x.message; } b.disabled = false; }
    else if (D.dm !== undefined) { try { mem = (await api('/memori', { aksi: 'hapus', i: +D.dm })).catatan; draw(); } catch (x) { alert(x.message); } }
  };
}

export const APPS = {
  chat: { t: 'Chat', fn: chat, flex: true }, ringkasan: { t: 'Ringkasan', fn: ringkasan }, karyawan: { t: 'Karyawan', fn: karyawan }, persetujuan: { t: 'Persetujuan', fn: persetujuan },
  draf: { t: 'Draf', fn: draf }, laporan: { t: 'Laporan', fn: laporan }, rutin: { t: 'Rutin', fn: rutin }, setelan: { t: 'Setelan', fn: setelan },
};
export const wrap = (fn, el, ctx) => guard(el, () => fn(el, ctx))();
