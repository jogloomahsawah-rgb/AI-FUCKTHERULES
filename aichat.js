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
  <div style="display:flex;border-bottom:1.5px solid var(--line)">${[['chat', 'Chat'], ['appr', 'Persetujuan'], ['draft', 'Draft']].map(([k, n]) => `<button data-aitab="${k}" style="flex:1;padding:9px 0;font-weight:700;font-size:13px;border-bottom:3px solid ${k === tab ? '#111' : 'transparent'};opacity:${k === tab ? 1 : .55}">${n}</button>`).join('')}</div>
  <div id="aiV" style="flex:1;overflow:auto;padding:12px"></div>
  <form id="aiF" style="display:${tab === 'chat' ? 'flex' : 'none'};gap:6px;padding:8px;border-top:1.5px solid var(--line)"><input id="aiQ" placeholder="Tulis instruksi…" autocomplete="off" style="flex:1;min-width:0;padding:10px;border:1.5px solid var(--line);border-radius:10px;font:inherit;background:#fff"><button style="background:#111;color:#fff;padding:0 14px;border-radius:10px;font-weight:700">Kirim</button></form>`;
  const v = el.querySelector('#aiV'), bub = (t, me) => { v.insertAdjacentHTML('beforeend', `<div style="margin:0 0 8px;padding:9px 11px;border-radius:12px;white-space:pre-wrap;font-size:13.5px;line-height:1.4;${me ? 'background:#111;color:#fff;margin-left:26px' : 'background:#fff;border:1.5px solid var(--line);margin-right:26px'}">${esc(t)}</div>`); v.scrollTop = 1e9; };
  el.querySelectorAll('[data-aitab]').forEach(b => b.onclick = e => { e.stopPropagation(); tab = b.dataset.aitab; renderAI(el); });
  el.querySelector('[data-ailogout]').onclick = e => { e.stopPropagation(); adminLogout(); };
  if (!WORKER_OK) v.innerHTML = '<p style="color:#b33;font-size:13px">URL Worker belum diisi. Buka config.js di repo lalu ganti URL Worker kamu.</p>';
  else if (tab === 'chat') { if (!hist.length) bub('Halo admin. Tanya order, produk, atau minta draft caption. Perubahan data selalu lewat persetujuan kamu.'); hist.forEach(m => bub(m.text, m.role === 'user')); }
  else loadList(v);
  el.querySelector('#aiF').onsubmit = async e => {
    e.preventDefault(); const q = el.querySelector('#aiQ'), t = q.value.trim(); if (!t || !WORKER_OK) return; q.value = '';
    hist.push({ role: 'user', text: t }); bub(t, true); bub('…'); const wait = v.lastChild;
    try { const r = await fetch(WORKER + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await getToken() }, body: JSON.stringify({ messages: hist }) }); const j = await r.json(); wait.remove();
      const c = j.cek, m = j.reply || ('Error: ' + j.error); hist.push({ role: 'model', text: m });
      bub(m + (c ? '\n\n[' + c.maker + (c.checker ? ' → dicek ' + c.checker + ': ' + c.verdict : ' · ' + c.verdict) + ']' + (c.masalah?.length ? '\n! ' + c.masalah.join('\n! ') : '') : '')); }
    catch (x) { wait.remove(); bub('Error: ' + x.message); } };
}
async function loadList(v) {
  const col = tab === 'appr' ? 'aiApprovals' : 'aiDrafts'; v.innerHTML = '<p style="color:#888;font-size:13px">Memuat…</p>';
  try {
    const s = await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(30))); v.innerHTML = s.empty ? '<p style="color:#888;font-size:13px">Kosong.</p>' : '';
    s.forEach(d => { const x = d.data(); v.insertAdjacentHTML('beforeend', `<div style="background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:10px;margin-bottom:8px;font-size:13px">` + (tab === 'appr'
      ? `<b>${esc(x.aksi)} · ${esc(x.status)}</b><br>${esc(x.detail)}<br><small style="color:#777">${esc(x.alasan)}</small>${x.status === 'pending' ? `<div style="display:flex;gap:6px;margin-top:8px"><button data-d="approved" data-id="${d.id}" style="flex:1;padding:8px;border-radius:8px;background:#111;color:#fff;font-weight:700">Setujui</button><button data-d="rejected" data-id="${d.id}" style="flex:1;padding:8px;border-radius:8px;border:1.5px solid #111;font-weight:700">Tolak</button></div>` : ''}`
      : `<b>${esc(x.jenis)}: ${esc(x.judul)}</b><br>${esc(x.isi)}`) + '</div>'); });
    v.querySelectorAll('[data-d]').forEach(b => b.onclick = async e => { e.stopPropagation(); await updateDoc(doc(db, 'aiApprovals', b.dataset.id), { status: b.dataset.d, decidedBy: A.user.email, decidedAt: new Date().toISOString() }); loadList(v); });
  } catch (e) { v.textContent = 'Gagal: ' + e.message; }
}
