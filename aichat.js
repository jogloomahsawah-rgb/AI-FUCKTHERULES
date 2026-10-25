// Khusus ADMIN: login Google, gerbang akses, dan aplikasi "AI" di dalam HP (Chat, Persetujuan, Draft).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { WORKER, WORKER_OK } from './config.js?v=1';

const app = initializeApp({ apiKey: 'AIzaSyCVL_C4opQiKC6fNG_Rw4l-519rQZICH58', authDomain: 'fvcktherules-store.firebaseapp.com', projectId: 'fvcktherules-store' }, 'admin-ai');
const auth = getAuth(app), db = getFirestore(app);
export const A = { user: null, ok: false };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const getToken = () => A.user ? A.user.getIdToken() : Promise.reject(new Error('Belum login admin'));

async function verify(u) {                      // Worker memastikan email ini admin
  if (!WORKER_OK) return { ok: true, warn: 'Worker belum dipasang, jadi akses belum diperiksa di server.' };
  try { const r = await fetch(WORKER + '/me', { headers: { Authorization: 'Bearer ' + await u.getIdToken() } }); return r.ok ? { ok: true } : { ok: false, err: 'Akun ini bukan admin.' }; }
  catch (e) { return { ok: false, err: 'Worker tidak terjangkau: ' + e.message }; }
}

/* ---------- gerbang: seluruh kantor hanya untuk admin ---------- */
export function mountGate(onOpen) {
  const g = document.createElement('div'); g.id = 'gate';
  g.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0a;color:#f2f2f2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif';
  g.innerHTML = `<img src="logo.png" alt="" width="84" style="opacity:.95"><div style="font:900 30px Impact,sans-serif;letter-spacing:.06em;color:#e8ff3a">AI OFFICE</div><div style="color:#aaa;font-size:14px;max-width:300px">Khusus admin FVCKTHERULES. Masuk dengan akun Google admin.</div>
  <button id="gIn" style="background:#e8ff3a;color:#0a0a0a;font:700 15px Inter,sans-serif;padding:13px 22px;border:0;border-radius:10px">Masuk dengan Google</button><div id="gErr" style="color:#ff7a7a;font-size:13px;min-height:18px;max-width:300px"></div>`;
  document.body.appendChild(g);
  const err = m => g.querySelector('#gErr').textContent = m;
  g.querySelector('#gIn').onclick = async () => { err(''); const p = new GoogleAuthProvider(); try { await signInWithPopup(auth, p); } catch (e) { if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') signInWithRedirect(auth, p); else err(e.message); } };
  onAuthStateChanged(auth, async u => {
    A.user = u; A.ok = false; if (!u) { g.style.display = 'flex'; return; }
    err('Memeriksa akses…'); const v = await verify(u);
    if (!v.ok) { err(v.err); await signOut(auth); return; }
    A.ok = true; g.style.display = 'none'; onOpen && onOpen(u);
  });
}
export const adminLogout = () => signOut(auth);

/* ---------- aplikasi AI di dalam HP ---------- */
let tab = 'chat'; const hist = [];
export function renderAI(el) {
  el.className = 'ph-app ph-web';
  el.innerHTML = `<div class="ph-bar"><button class="ph-bk" data-back aria-label="Kembali">‹</button><span class="ph-tt">ai</span><button class="ph-bk" data-ailogout aria-label="Keluar" style="font-size:15px">⎋</button></div>
  <div style="display:flex;border-bottom:1.5px solid var(--line)">${[['chat', 'Chat'], ['set', 'Setelan']].map(([k, n]) => `<button data-aitab="${k}" style="flex:1;padding:9px 0;font-weight:700;font-size:13px;border-bottom:3px solid ${k === tab ? '#111' : 'transparent'};opacity:${k === tab ? 1 : .55}">${n}</button>`).join('')}</div>
  <div id="aiV" style="flex:1;overflow:auto;padding:12px"></div>
  <form id="aiF" style="display:${tab === 'chat' ? 'flex' : 'none'};gap:6px;padding:8px;border-top:1.5px solid var(--line)"><input id="aiQ" placeholder="Tulis instruksi…" autocomplete="off" style="flex:1;min-width:0;padding:10px;border:1.5px solid var(--line);border-radius:10px;font:inherit;background:#fff"><button style="background:#111;color:#fff;padding:0 14px;border-radius:10px;font-weight:700">Kirim</button></form>`;
  const v = el.querySelector('#aiV'), bub = (t, me) => { v.insertAdjacentHTML('beforeend', `<div style="margin:0 0 8px;padding:9px 11px;border-radius:12px;white-space:pre-wrap;font-size:13.5px;line-height:1.4;${me ? 'background:#111;color:#fff;margin-left:26px' : 'background:#fff;border:1.5px solid var(--line);margin-right:26px'}">${esc(t)}</div>`); v.scrollTop = 1e9; };
  el.querySelectorAll('[data-aitab]').forEach(b => b.onclick = e => { e.stopPropagation(); tab = b.dataset.aitab; renderAI(el); });
  el.querySelector('[data-ailogout]').onclick = e => { e.stopPropagation(); adminLogout(); };
  if (!WORKER_OK) v.innerHTML = '<p style="color:#b33;font-size:13px">URL Worker belum diisi. Buka config.js di repo lalu ganti URL Worker kamu.</p>';
  else if (tab === 'chat') { if (!hist.length) bub('Halo admin. Tanya order, produk, atau minta draft caption. Perubahan data selalu lewat persetujuan kamu.'); hist.forEach(m => bub(m.text, m.role === 'user')); }
  else loadSet(v);
  el.querySelector('#aiF').onsubmit = async e => {
    e.preventDefault(); const q = el.querySelector('#aiQ'), t = q.value.trim(); if (!t || !WORKER_OK) return; q.value = '';
    hist.push({ role: 'user', text: t }); bub(t, true); bub('…'); const wait = v.lastChild;
    try { const r = await fetch(WORKER + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await getToken() }, body: JSON.stringify({ messages: hist }) }); const j = await r.json(); wait.remove();
      const c = j.cek, m = j.reply || ('Error: ' + j.error + (j.log?.length ? '\n\nDetail:\n- ' + j.log.join('\n- ') : '')); if (j.reply) hist.push({ role: 'model', text: m }); else hist.pop();
      bub(m + (c ? '\n\n[' + c.maker + (c.checker ? ' → dicek ' + c.checker + ': ' + c.verdict : ' · ' + c.verdict) + ']' + (c.masalah?.length ? '\n! ' + c.masalah.join('\n! ') : '') : '')); }
    catch (x) { wait.remove(); bub('Error: ' + x.message); } };
}
async function loadTim(v) {
  v.innerHTML = '<p style="color:#888;font-size:13px">Memuat…</p>';
  try {
    const r = await fetch(WORKER + '/status'), j = await r.json(); if (!r.ok) throw new Error(j.error || r.status);
    const col = { kerja: '#16a34a', selesai: '#2563eb', santai: '#a16207' };
    v.innerHTML = j.agents.map(a => `<div style="background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:10px;margin-bottom:8px;font-size:13px"><div style="display:flex;justify-content:space-between;gap:6px"><b>${esc(a.emoji)} ${esc(a.role)}</b><span style="font-size:11px;font-weight:700;color:${col[a.mode] || '#555'}">${esc(a.mode.toUpperCase())}</span></div>${esc(a.aktivitas)} · <span style="color:#555">${esc(a.ket)}</span><br><small style="color:#777">${esc(a.tugas)}<br>Jam kerja ${esc(a.jam)} · berikutnya ${esc(a.berikut)} · ${a.ai ? 'pakai AI' : 'tanpa AI'}${a.flag ? ' · ⚠️ perlu perhatian' : ''}</small>${a.mode === 'santai' ? '<br><small style="color:#999">Aktivitas santai = hiburan kantor, bukan pekerjaan nyata.</small>' : ''}</div>`).join('')
      + `<p style="font-size:12px;color:#777">Anggaran AI terjadwal hari ini: ${esc(j.anggaran_ai.terpakai)}/${esc(j.anggaran_ai.batas)} (perkiraan). ${esc(j.catatan || '')}</p>`;
  } catch (e) { v.textContent = 'Gagal memuat status: ' + e.message; }
}
async function loadList(v, tab) {
  const col = tab === 'appr' ? 'aiApprovals' : 'aiDrafts'; v.innerHTML = '<p style="color:#888;font-size:13px">Memuat…</p>';
  try {
    const s = await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(30))); v.innerHTML = s.empty ? '<p style="color:#888;font-size:13px">Kosong.</p>' : '';
    s.forEach(d => { const x = d.data(); v.insertAdjacentHTML('beforeend', `<div style="background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:10px;margin-bottom:8px;font-size:13px">` + (tab === 'appr'
      ? `<b>${esc(x.aksi)} · ${esc(x.status)}</b><br>${esc(x.detail)}<br><small style="color:#777">${esc(x.alasan)}</small>${x.status === 'pending' ? `<div style="display:flex;gap:6px;margin-top:8px"><button data-d="approved" data-id="${d.id}" style="flex:1;padding:8px;border-radius:8px;background:#111;color:#fff;font-weight:700">Setujui</button><button data-d="rejected" data-id="${d.id}" style="flex:1;padding:8px;border-radius:8px;border:1.5px solid #111;font-weight:700">Tolak</button></div>` : ''}`
      : `<b>${esc(x.jenis)}: ${esc(x.judul)}</b>${x.status ? ' <small style="color:#a16207;font-weight:700">' + esc(x.status) + '</small>' : ''}<div style="white-space:pre-wrap;margin-top:4px">${esc(x.isi)}</div>`) + '</div>'); });
    v.querySelectorAll('[data-d]').forEach(b => b.onclick = async e => { e.stopPropagation(); await updateDoc(doc(db, 'aiApprovals', b.dataset.id), { status: b.dataset.d, decidedBy: A.user.email, decidedAt: new Date().toISOString() }); loadList(v, tab); });
  } catch (e) { v.textContent = 'Gagal: ' + e.message; }
}

/* ---------- Setelan: konten harian, persetujuan, draft, tim ---------- */
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
async function api(path, body) {
  const r = await fetch(WORKER + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await getToken() }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); return j;
}
async function loadSet(v) {
  v.innerHTML = '<p style="color:#888;font-size:13px">Memuat…</p>';
  let d; try { d = await api('/settings'); } catch (e) { v.innerHTML = `<p style="color:#b33;font-size:13px">Gagal memuat setelan: ${esc(e.message)}</p>`; return; }
  const c = d.settings, T = d.tema, card = 'background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:10px;margin-bottom:10px;font-size:13px', inp = 'width:100%;box-sizing:border-box;padding:8px;border:1.5px solid var(--line);border-radius:8px;font:inherit;background:#fff', btn = (on) => `padding:7px 11px;border-radius:8px;font-weight:700;font-size:12px;border:1.5px solid #111;${on ? 'background:#111;color:#fff' : 'background:#fff;color:#111'}`;
  const opts = sel => Object.entries(T).map(([k, n]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(n)}</option>`).join('');
  const draw = () => { v.innerHTML = `
  <div style="${card}"><b>Hari ini</b><br>Tema: <b>${esc(d.hariIni.label)}</b> (urutan ${d.hariIni.urutan}/${d.hariIni.dari}) · mode <b>${esc(c.mode)}</b><br><small style="color:#777">Satu ide + caption matang per hari. Posting tetap manual: auto-post Instagram belum tersedia.</small></div>
  <div style="${card}"><b>Mode</b><div style="display:flex;gap:6px;margin:6px 0"><button data-m="otomatis" style="${btn(c.mode === 'otomatis')}">Otomatis</button><button data-m="manual" style="${btn(c.mode === 'manual')}">Manual</button></div><small style="color:#777">Otomatis: ide jam 09:00, caption jam 10:00 WIB. Manual: hanya saat kamu tekan tombol Buat.</small></div>
  <div style="${card}"><b>Upload per minggu</b> <select id="sPm" style="padding:5px;border-radius:6px;border:1.5px solid var(--line)">${[0, 1, 2, 3].map(n => `<option${n === c.perMinggu ? ' selected' : ''}>${n}</option>`).join('')}</select><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">${HARI.map((h, i) => `<button data-h="${i}" style="${btn(c.hariUpload.includes(i))}">${h}</button>`).join('')}</div><small style="color:#777">Di hari upload, AI memilih konten terbaik minggu itu jadi paket siap upload (tab Draft di bawah).</small></div>
  <div style="${card}"><b>Rotasi tema harian</b>${c.rotasi.map((t, i) => `<div style="display:flex;gap:6px;margin-top:6px;align-items:center"><span style="width:18px;color:#777">${i + 1}</span><select data-r="${i}" style="${inp}">${opts(t)}</select><button data-x="${i}" style="${btn(false)}">×</button></div>`).join('')}${c.rotasi.length < 7 ? `<button data-add style="${btn(false)};margin-top:8px">+ Tambah hari</button>` : ''}<br><small style="color:#777">Contoh: Instagram, Instagram, Branding, Produk selanjutnya, lalu berulang.</small></div>
  <div style="${card}"><b>Catatan brand</b> <small style="color:#777">(nada, larangan, fokus)</small><textarea id="sBr" rows="3" maxlength="1500" style="${inp};margin-top:6px">${esc(c.catatanBrand)}</textarea><b style="display:block;margin-top:10px">Momen & tren terkini</b><small style="color:#777">Pertandingan penting, rilis, isu yang mau diikuti. AI juga membaca artikel jurnal terbaru otomatis.</small><textarea id="sMo" rows="2" maxlength="600" style="${inp};margin-top:6px">${esc(c.momen || '')}</textarea><b style="display:block;margin-top:10px">Produk selanjutnya</b><input id="sPn" maxlength="80" placeholder="Nama / kode produk" value="${esc(c.produkNext.nama)}" style="${inp};margin:6px 0"><textarea id="sPc" rows="3" maxlength="600" placeholder="Konsep, warna, rencana rilis…" style="${inp}">${esc(c.produkNext.catatan)}</textarea></div>
  <button data-save style="${btn(true)};width:100%;padding:11px;font-size:14px">Simpan setelan</button><div id="sMsg" style="font-size:12px;min-height:18px;margin:6px 0"></div>
  <div style="${card}"><b>Buat konten sekarang</b> <small style="color:#777">(manual, maks 10/hari)</small><div style="display:flex;gap:6px;margin-top:6px"><select id="sTm" style="${inp}">${opts(d.hariIni.tema)}</select><button data-gen style="${btn(true)}">Buat</button></div><div id="sGen" style="white-space:pre-wrap;font-size:12.5px;margin-top:8px"></div></div>
  ${[['appr', 'Persetujuan'], ['draft', 'Draft & paket upload'], ['tim', 'Tim & jadwal agen']].map(([k, n]) => `<details data-k="${k}" style="${card}"><summary style="font-weight:700">${n}</summary><div class="dd" style="margin-top:8px"></div></details>`).join('')}`;
    const msg = (t, bad) => { const m = v.querySelector('#sMsg'); m.style.color = bad ? '#b33' : '#16a34a'; m.textContent = t; };
    const grab = () => { c.catatanBrand = v.querySelector('#sBr').value; c.momen = v.querySelector('#sMo').value; c.produkNext = { nama: v.querySelector('#sPn').value, catatan: v.querySelector('#sPc').value }; c.perMinggu = +v.querySelector('#sPm').value; c.hariUpload = c.hariUpload.slice(0, c.perMinggu); };
    v.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { grab(); c.mode = b.dataset.m; draw(); });
    v.querySelector('#sPm').onchange = () => { grab(); draw(); };
    v.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { grab(); const h = +b.dataset.h, i = c.hariUpload.indexOf(h); if (i >= 0) c.hariUpload.splice(i, 1); else if (c.hariUpload.length < c.perMinggu) c.hariUpload.push(h); draw(); });
    v.querySelectorAll('[data-r]').forEach(sel => sel.onchange = () => { c.rotasi[+sel.dataset.r] = sel.value; });
    v.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { grab(); if (c.rotasi.length > 1) c.rotasi.splice(+b.dataset.x, 1); draw(); });
    const add = v.querySelector('[data-add]'); if (add) add.onclick = () => { grab(); c.rotasi.push('instagram'); draw(); };
    v.querySelector('[data-save]').onclick = async () => { grab(); msg('Menyimpan…'); try { const r = await api('/settings', c); d = r; Object.assign(c, r.settings); msg('Tersimpan.'); setTimeout(() => loadSet(v), 600); } catch (e) { msg('Gagal: ' + e.message, true); } };
    v.querySelector('[data-gen]').onclick = async e => { const b = e.target, g = v.querySelector('#sGen'); b.disabled = true; g.textContent = 'AI sedang menulis (bisa 10–30 detik)…'; try { const r = await api('/konten/buat', { tema: v.querySelector('#sTm').value }); g.textContent = r.tema + ' — tersimpan di Draft.\n\n' + r.isi; } catch (x) { g.textContent = 'Gagal: ' + x.message; } b.disabled = false; };
    v.querySelectorAll('details[data-k]').forEach(dt => dt.addEventListener('toggle', () => { if (!dt.open) return; const t = dt.querySelector('.dd'), k = dt.dataset.k; k === 'tim' ? loadTim(t) : loadList(t, k); }));
  };
  draw();
}
