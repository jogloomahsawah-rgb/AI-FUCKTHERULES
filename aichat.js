// Khusus ADMIN: login email + password ATAU Google, gerbang akses, dan helper API ke Worker. Aplikasi di dalam HP ada di aiapps.js.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
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
  const inp = 'width:100%;box-sizing:border-box;background:#161616;color:#f2f2f2;font:15px Inter,sans-serif;padding:13px 14px;border:1px solid #333;border-radius:10px';
  g.innerHTML = `<img src="logo.png" alt="" width="84" style="opacity:.95"><div style="font:900 30px Impact,sans-serif;letter-spacing:.06em;color:#e8ff3a">AI OFFICE</div><div style="color:#aaa;font-size:14px;max-width:300px">Khusus admin FVCKTHERULES. Masuk dengan email dan password admin, atau dengan Google.</div>
  <form id="gForm" style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px">
    <input id="gEmail" type="email" placeholder="Email admin" autocomplete="username" required style="${inp}">
    <input id="gPass" type="password" placeholder="Password" autocomplete="current-password" required style="${inp}">
    <button id="gIn" type="submit" style="background:#e8ff3a;color:#0a0a0a;font:700 15px Inter,sans-serif;padding:13px 22px;border:0;border-radius:10px">Masuk</button>
    <button id="gForgot" type="button" style="background:none;border:0;color:#aaa;font:13px Inter,sans-serif;text-decoration:underline;padding:4px">Lupa password?</button>
  </form>
  <div style="display:flex;align-items:center;gap:10px;width:100%;max-width:300px;color:#666;font-size:13px"><span style="flex:1;height:1px;background:#333"></span>atau<span style="flex:1;height:1px;background:#333"></span></div>
  <button id="gGoogle" type="button" style="width:100%;max-width:300px;background:#fff;color:#111;font:700 15px Inter,sans-serif;padding:13px 22px;border:0;border-radius:10px">Masuk dengan Google</button><div id="gErr" style="color:#ff7a7a;font-size:13px;min-height:18px;max-width:300px"></div>`;
  document.body.appendChild(g);
  const $g = s => g.querySelector(s), err = (m, ok) => { const el = $g('#gErr'); el.textContent = m; el.style.color = ok ? '#8be28b' : '#ff7a7a'; };
  const pesan = c => ({
    'auth/invalid-credential': 'Email atau password salah.', 'auth/wrong-password': 'Email atau password salah.', 'auth/user-not-found': 'Email atau password salah.',
    'auth/invalid-email': 'Format email tidak valid.', 'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
    'auth/network-request-failed': 'Koneksi bermasalah. Coba lagi.', 'auth/user-disabled': 'Akun ini dinonaktifkan.', 'auth/operation-not-allowed': 'Login Email/Password belum diaktifkan di Firebase.'
  }[c] || 'Gagal masuk (' + (c || 'error') + ').');
  $g('#gForm').onsubmit = async ev => {
    ev.preventDefault(); err(''); $g('#gIn').disabled = true;
    try { await signInWithEmailAndPassword(auth, $g('#gEmail').value.trim(), $g('#gPass').value); }
    catch (e) { err(pesan(e.code)); }
    $g('#gIn').disabled = false;
  };
  $g('#gGoogle').onclick = async () => { err(''); const p = new GoogleAuthProvider(); try { await signInWithPopup(auth, p); } catch (e) { if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') signInWithRedirect(auth, p); else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') err(pesan(e.code)); } };
  $g('#gForgot').onclick = async () => {
    const em = $g('#gEmail').value.trim(); if (!em) return err('Isi email admin dulu, lalu tekan Lupa password.');
    try { await sendPasswordResetEmail(auth, em); err('Tautan atur password dikirim ke ' + em + '. Cek inbox/spam.', true); }
    catch (e) { err(pesan(e.code)); }
  };
  onAuthStateChanged(auth, async u => {
    A.user = u; A.ok = false; if (!u) { g.style.display = 'flex'; return; }
    if (!u.emailVerified) {                       // Worker hanya menerima email yang sudah terverifikasi
      try { await sendEmailVerification(u); } catch (e) { /* abaikan, mis. terlalu sering */ }
      await signOut(auth); err('Email belum diverifikasi. Tautan verifikasi dikirim ke ' + u.email + '. Klik tautannya, lalu masuk lagi.'); return;
    }
    err('Memeriksa akses…', true); const v = await verify(u);
    if (!v.ok) { err(v.err); await signOut(auth); return; }
    err(''); A.ok = true; g.style.display = 'none'; onOpen && onOpen(u);
  });
}
export const adminLogout = () => signOut(auth);

/* ---------- helper API ke Worker (semua data aplikasi HP lewat sini) ---------- */
export { WORKER_OK };
export async function api(path, body) {
  const r = await fetch(WORKER + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await getToken() }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) { const x = new Error(j.error || 'HTTP ' + r.status); x.log = j.log; throw x; } return j;
}
