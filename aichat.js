// Khusus ADMIN: login Google, gerbang akses, dan helper API ke Worker. Aplikasi di dalam HP ada di aiapps.js.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { WORKER, WORKER_OK } from './config.js?v=1';

const app = initializeApp({ apiKey: 'AIzaSyCVL_C4opQiKC6fNG_Rw4l-519rQZICH58', authDomain: 'fvcktherules-store.firebaseapp.com', projectId: 'fvcktherules-store' }, 'admin-ai');
const auth = getAuth(app);
export const A = { user: null, ok: false, info: {} };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const getToken = () => A.user ? A.user.getIdToken() : Promise.reject(new Error('Belum login admin'));

async function verify(u) {                      // Worker memastikan email ini admin
  if (!WORKER_OK) return { ok: true, warn: 'Worker belum dipasang, jadi akses belum diperiksa di server.' };
  try { const r = await fetch(WORKER + '/me', { headers: { Authorization: 'Bearer ' + await u.getIdToken() } }); if (!r.ok) return { ok: false, err: 'Akun ini bukan admin.' }; A.info = await r.json().catch(() => ({})); return { ok: true }; }
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

/* ---------- helper API ke Worker (semua data aplikasi HP lewat sini) ---------- */
export { WORKER_OK };
export async function api(path, body) {
  const r = await fetch(WORKER + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await getToken() }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) { const x = new Error(j.error || 'HTTP ' + r.status); x.log = j.log; throw x; } return j;
}
