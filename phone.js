// phone.js — "HP" admin di dalam AI OFFICE. Hanya aplikasi AI (lihat aiapps.js); aplikasi toko/berita/lacak sengaja dibuang.
import { A, api, WORKER_OK } from './aichat.js?v=2';
import { APPS, wrap } from './aiapps.js?v=2';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON = {
  chat: svg('<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/><path d="M9 11h6M9 14h4"/>'),
  ringkasan: svg('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="4" rx="1.5"/><rect x="13" y="10" width="7" height="10" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/>'),
  karyawan: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2a4.6 4.6 0 0 1 4.5 4.3"/>'),
  persetujuan: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8L16.3 9.4"/>'),
  draf: svg('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2"/>'),
  laporan: svg('<path d="M5 20V10M10 20V4M15 20v-7M20 20V8"/>'),
  rutin: svg('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5"/>'),
  setelan: svg('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'),
  sig: '<svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5" width="3" height="7" rx=".8"/><rect x="10" y="2.5" width="3" height="9.5" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>',
  wifi: '<svg viewBox="0 0 18 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1.5 4.5a11 11 0 0 1 15 0M4.2 7.4a7 7 0 0 1 9.6 0M7 10.2a3 3 0 0 1 4 0"/></svg>',
  bat: '<svg viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3.2" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="3" width="17" height="7" rx="1.6" fill="currentColor"/><rect x="23" y="4.5" width="2" height="4" rx="1" fill="currentColor"/></svg>',
};
// urutan ikon: yang paling sering dipakai di baris atas
const HOME = [
  ['chat', 'Chat', 'background:#111;color:#e8ff3a'], ['ringkasan', 'Ringkasan', 'background:#ffca1f;color:#111'], ['karyawan', 'Karyawan', 'background:#45e08f;color:#111'], ['persetujuan', 'Persetujuan', 'background:#ff5f1f;color:#fffdf3'],
  ['draf', 'Draf', 'background:#b5c4ff;color:#111'], ['laporan', 'Laporan', 'background:#c3effd;color:#111'], ['rutin', 'Rutin', 'background:#ffe1b0;color:#111'], ['setelan', 'Setelan', 'background:#111;color:#fffdf3'],
];

export function initPhone({ onOpen, onClose } = {}) {
  const root = document.createElement('div'); root.id = 'phone'; root.className = 'ph-wrap'; root.hidden = true;
  root.innerHTML = `<button class="ph-x" aria-label="Tutup HP">✕</button>
  <div class="ph-device"><i class="ph-key k1"></i><i class="ph-key k2"></i><i class="ph-key k3"></i>
    <div class="ph-screen">
      <div class="ph-status"><b class="ph-time"></b><span class="ph-cam"></span><span class="ph-sys">${ICON.sig}${ICON.wifi}${ICON.bat}</span></div>
      <div class="ph-app" id="phApp"></div>
      <button class="ph-nav" aria-label="Beranda"><i></i></button>
    </div></div>`;
  document.body.appendChild(root);
  const app = root.querySelector('#phApp'), timeEl = root.querySelector('.ph-time'), states = {};
  let view = 'home', hist = [], open = false, clk = 0, badge = { t: 0, v: null }, seq = 0;
  const clock = () => { timeEl.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'); };

  async function loadBadge() {   // angka kecil di ikon (pakai /ringkasan, tanpa AI; dicache 60 detik)
    if (!WORKER_OK || !A.ok || Date.now() - badge.t < 6e4) return; badge.t = Date.now();
    try { badge.v = await api('/ringkasan'); if (view === 'home') renderHome(); } catch { badge.t = 0; }
  }
  function renderHome() {
    const d = new Date(), tm = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'), dt = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    const n = { persetujuan: badge.v?.persetujuan?.pending || 0, karyawan: badge.v?.agen?.perhatian || 0 };
    app.className = 'ph-app ph-homebg';
    app.innerHTML = `<div class="ph-widget"><div class="ph-bigtime">${tm}</div><div class="ph-date">${esc(dt)}</div></div>
    <div class="ph-grid">${HOME.map(([k, l, st]) => `<button data-open="${k}"><span class="ph-ic" style="${st}">${k === 'chat' ? '<b class="ph-ai">AI</b>' : ICON[k]}${n[k] ? `<i class="ph-badge">${n[k] > 9 ? '9+' : n[k]}</i>` : ''}</span><em>${l}</em></button>`).join('')}</div>
    <div class="ph-brand"><img src="logo.png" alt="" width="34" height="48"><span>fvcktherules</span></div>`;
    loadBadge();
  }
  function renderApp(name, extra) {
    const def = APPS[name], st = states[name] ||= {}; Object.assign(st, extra || {});
    const ctx = Object.assign(st, { go, refresh: () => renderApp(name) });
    const my = ++seq; app.className = 'ph-app ph-web';
    app.innerHTML = `<div class="ph-bar"><button class="ph-bk" data-back aria-label="Kembali">‹</button><span class="ph-tt">${def.t}</span>${def.flex ? '<span class="ph-sp"></span>' : '<button class="ph-bk" data-refresh aria-label="Muat ulang">⟳</button>'}</div><div class="ai-body ${def.flex ? 'chat' : ''}" id="aiBody"></div>`;
    const body = app.querySelector('#aiBody'); body.onclick = e => { if (e.target.closest('[data-retry]')) renderApp(name); };
    if (!A.ok) { body.innerHTML = '<div class="ai-empty"><b>Belum masuk</b>Masuk dengan akun Google admin dulu.</div>'; return; }
    wrap(def.fn, body, ctx).then(() => { if (my === seq) delete st.kirim; });
  }
  function render() { clock(); root.querySelector('.ph-screen').classList.toggle('home', view === 'home'); view === 'home' ? renderHome() : renderApp(view); }
  function go(name, extra) { if (!APPS[name]) return; hist.push(view); view = name; states[name] = Object.assign(states[name] || {}, extra || {}); render(); app.scrollTop = 0; }
  const home = () => { hist = []; view = 'home'; render(); };

  app.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.open) return go(t.dataset.open);
    if (t.dataset.back !== undefined) return hist.length ? (view = hist.pop(), render()) : home();
    if (t.dataset.refresh !== undefined) { if (view === 'home') { badge.t = 0; return renderHome(); } renderApp(view); }
  });
  const closePhone = () => { if (!open) return; open = false; root.hidden = true; clearInterval(clk); seq++; app.innerHTML = ''; onClose && onClose(); };
  const openPhone = () => { if (open) return; open = true; hist = []; view = 'home'; root.hidden = false; onOpen && onOpen(); render(); clk = setInterval(() => { clock(); if (view === 'home') renderHome(); }, 20000); };
  root.querySelector('.ph-x').onclick = closePhone;
  root.addEventListener('pointerdown', e => { if (e.target === root) closePhone(); });            // ketuk di luar HP = tutup
  root.querySelector('.ph-nav').onclick = () => (view === 'home' ? closePhone() : home());          // tombol/gesture beranda
  return { open: openPhone, close: closePhone, toggle: () => (open ? closePhone() : openPhone()), isOpen: () => open };
}
