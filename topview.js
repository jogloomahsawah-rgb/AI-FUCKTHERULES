// Tampilan ATAS: denah lengkap gaya kardus = TOKO + KANTOR + DAPUR + TAMAN.
// Tanpa karakter pemain dan tanpa joystick. Geser = putar, dua jari = zoom + geser peta, scroll = zoom.
// Agen kantor berjalan ke dapur / taman saat tidak ada kerjaan. KASIR dan STOK-BOT mengikuti posisi asli dari office.js.
import { ROOMS, DOORS, AGENTS, WALLS, BREAK_EXIT, joinPath, OFFICE_X2 } from './layout.js?v=3';
export function initTopView({ THREE, getState, getHangers, report }) {
  const wrap = document.createElement('div'); wrap.id = 'tv'; wrap.hidden = true;
  wrap.innerHTML = '<canvas></canvas><div class="tv-cards"></div><div class="tv-labels"></div><div class="tv-hint">Geser: putar · cubit: zoom · dua jari: geser peta · ketuk MANAGER untuk laporan</div><div class="tv-rep" hidden><div class="tv-rep-in"><pre></pre><div class="tv-rep-b"><button data-ai>Ringkas dengan AI</button><button data-x>Tutup</button></div></div></div>';
  document.body.appendChild(wrap);
  const cv = wrap.querySelector('canvas'), cards = wrap.querySelector('.tv-cards'), labs = wrap.querySelector('.tv-labels'), repEl = wrap.querySelector('.tv-rep'), repPre = repEl.querySelector('pre');
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setClearColor(0x0b1226);
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1, .1, 300);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 1.55)); const dl = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(-8, 20, 12); sc.add(dl);
  const mat = {}, mt = c => mat[c] || (mat[c] = new THREE.MeshLambertMaterial({ color: c }));
  const box = (w, h, d, c, x, y, z, p = sc) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt(c)); m.position.set(x, y, z); p.add(m); return m; };
  const cvTex = (n, fn, rx, ry) => { const c = document.createElement('canvas'); c.width = c.height = n; fn(c.getContext('2d'), n); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const floor = (x1, z1, x2, z2, tex) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x2 - x1, .2, z2 - z1), new THREE.MeshLambertMaterial({ map: tex })); m.position.set((x1 + x2) / 2, -.1, (z1 + z2) / 2); sc.add(m); };
  const wall = (x1, z1, x2, z2, c = 0xf3f2ee, h = 1.2) => box(Math.abs(x2 - x1) || .25, h, Math.abs(z2 - z1) || .25, c, (x1 + x2) / 2, h / 2, (z1 + z2) / 2);
  const label = (txt, x, z) => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(10,10,10,.55)'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#e8ff3a'; g.font = '900 40px Impact,sans-serif'; g.textAlign = 'center'; g.fillText(txt, 128, 47); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .65), new THREE.MeshBasicMaterial({ map: t, transparent: true })); m.rotation.x = -Math.PI / 2; m.position.set(x, .06, z); sc.add(m); };

  /* lantai */
  const wood = cvTex(128, (g, n) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#e9a95f' : '#f0b469'; g.fillRect(0, i * 16, n, 14); g.fillStyle = '#c98a45'; g.fillRect(0, i * 16 + 14, n, 2); } }, 10, 6);
  const tile = cvTex(64, (g, n) => { g.fillStyle = '#dedad2'; g.fillRect(0, 0, n, n); g.fillStyle = '#c9c4ba'; g.fillRect(0, 0, n, 2); g.fillRect(0, 0, 2, n); }, 16, 12);
  const tileK = cvTex(64, (g, n) => { g.fillStyle = '#d4ebf2'; g.fillRect(0, 0, n, n); g.fillStyle = '#b9d9e4'; g.fillRect(0, 0, n, 2); g.fillRect(0, 0, 2, n); }, 7, 6);
  const grass = cvTex(64, (g, n) => { g.fillStyle = '#7ccf6a'; g.fillRect(0, 0, n, n); g.fillStyle = '#6dc15c'; for (let i = 0; i < 14; i++) g.fillRect((i * 37) % n, (i * 23) % n, 6, 6); }, 4, 4);
  floor(-8.1, -6.1, 8.1, 6.1, tile); floor(8.1, -6.1, OFFICE_X2 + .1, 6.1, wood); floor(8.1, 6.1, 15.2, 12.6, tileK); floor(15.2, 6.1, 22.2, 12.6, grass);
  ROOMS.forEach(r => box(r.x2 - r.x1 - .6, .05, r.z2 - r.z1 - .6, r.rug, (r.x1 + r.x2) / 2, .03, (r.z1 + r.z2) / 2));
  label('TOKO', -6.2, -5.2); ROOMS.forEach(r => label(r.name, r.lab[0], r.lab[1])); label('DAPUR', 9.8, 11.7); label('TAMAN', 20.6, 7);

  /* dinding rendah (denah rumah boneka) */
  wall(-8.1, -6.1, OFFICE_X2 + .1, -6.1); wall(-8.1, -6.1, -8.1, 6.1); wall(-8.1, 6.1, 8.1, 6.1, 0xbfe0f7, .9);
  wall(8.1, -6.1, 8.1, .9); wall(8.1, 2.3, 8.1, 6.1); wall(OFFICE_X2 + .1, -6.1, OFFICE_X2 + .1, 6.1);
  wall(8.1, 6.1, 10.2, 6.1); wall(11.8, 6.1, 18.6, 6.1); wall(20.2, 6.1, OFFICE_X2 + .1, 6.1);
  wall(8.1, 6.1, 8.1, 12.6); wall(8.1, 12.6, 15.2, 12.6); wall(15.2, 6.1, 15.2, 8.9); wall(15.2, 10.3, 15.2, 12.6);
  wall(15.2, 12.6, 22.2, 12.6, 0x4aa35a, .8); wall(22.2, 6.1, 22.2, 12.6, 0x4aa35a, .8);
  [-4.5, 0, 4.5].forEach(x => box(1.4, .5, .1, 0xbfe0f7, x, .85, -6.0));
  WALLS.forEach(([x1, z1, x2, z2]) => wall(x1, z1, x2, z2, 0xe7e4dc, .9));

  /* TOKO: kasir, rak belakang kasir, meja aksesoris, papan drop */
  box(3.2, 1.05, .9, 0x222222, 5, .52, 3.5); box(3.3, .06, 1, 0xf5f5f5, 5, 1.08, 3.5); box(3.2, 1.9, .3, 0x333333, 5, .95, 2.1); [.4, 1, 1.6].forEach((y, i) => { for (let k = 0; k < 6; k++) box(.4, .3, .25, [0x141414, 0xe9e9e6, 0x7d7d80, 0x2c4a7a][(k + i) % 4], 3.75 + k * .48, y + .2, 2.3); });
  box(.9, .8, 2, 0xe3c28f, -7.3, .4, 1.85); box(1.4, .9, .1, 0x222222, 5, 1.3, -5.9); box(.6, 1.6, .1, 0xcbd5e1, -6, .9, -5.9);
  let hgN = -1, hg = null; const PAL = [0x141414, 0xe9e9e6, 0xd9482b, 0x2c4a7a, 0xe3a008, 0x7d7d80];
  function syncRacks() { const H = (getHangers && getHangers()) || []; if (H.length === hgN) return; hgN = H.length; if (hg) sc.remove(hg); hg = new THREE.Group(); sc.add(hg);
    H.forEach((h, i) => { const g = new THREE.Group(); g.position.set(h.x, 0, h.z); hg.add(g); box(1.1, .04, .4, 0x222222, 0, .02, 0, g); [-.5, .5].forEach(s => box(.05, 1.6, .05, 0x222222, s, .8, 0, g)); box(1.05, .05, .05, 0x222222, 0, 1.55, 0, g);
      for (let k = 0; k < 3; k++) box(.28, .55, .07, PAL[(i + k * 2) % PAL.length], -.3 + k * .3, 1.25, 0, g); }); }

  /* DAPUR */
  box(.8, .9, 3.4, 0xf4efe2, 8.6, .45, 8.6); box(.9, .06, 3.5, 0x6b5b4b, 8.6, .93, 8.6); box(.4, .5, .4, 0x222222, 8.6, 1.2, 7.6); box(.2, .05, .2, 0xe33b3b, 8.6, 1.47, 7.6); box(.5, .05, .7, 0xbfe0f7, 8.6, .97, 9.6);
  box(.9, 1.9, .9, 0xeeeeee, 8.7, .95, 11.8); box(.05, .6, .08, 0x888888, 9.18, 1.2, 11.5);
  box(1.9, .08, 1.1, 0xe3c28f, 12.5, .78, 9.6); [[-.8, -.4], [.8, -.4], [-.8, .4], [.8, .4]].forEach(([a, b]) => box(.08, .74, .08, 0xb79a68, 12.5 + a, .37, 9.6 + b));
  [[11.9, 10.5], [13.1, 10.5], [12.5, 8.7]].forEach(([x, z]) => { box(.5, .08, .5, 0xd9482b, x, .42, z); box(.08, .4, .08, 0x555555, x, .2, z); }); box(.3, .06, .3, 0xffffff, 12.2, .84, 9.6); box(.3, .06, .3, 0xffffff, 12.9, .84, 9.4);

  /* TAMAN */
  [[20.6, 8.2, 1], [21.3, 11.3, .8], [16.3, 7.2, .9], [15.9, 11.6, .7]].forEach(([x, z, s]) => { box(.35 * s, 1.4 * s, .35 * s, 0x8a5a3b, x, .7 * s, z); box(1.6 * s, 1.3 * s, 1.6 * s, 0x3f9e55, x, 1.9 * s, z); box(1 * s, .8 * s, 1 * s, 0x4fb868, x, 2.8 * s, z); });
  box(2.6, .05, 1.9, 0xcbbf9a, 17.4, .03, 9.0); box(2.2, .07, 1.5, 0x6cc3ee, 17.4, .06, 9.0);
  box(1.9, .12, .5, 0x8a5a3b, 18, .42, 11.45); box(1.9, .5, .1, 0x8a5a3b, 18, .75, 11.8); [-.8, .8].forEach(s => box(.1, .4, .4, 0x6b4428, 18 + s, .2, 11.45));
  [[19.4, 7.4], [19.4, 8.2], [19.6, 9.0]].forEach(([x, z]) => box(.55, .04, .45, 0xbdb8aa, x, .04, z)); for (let i = 0; i < 6; i++) box(.3, .3, .3, [0xff6b8b, 0xffd23f, 0xffffff][i % 3], 16.2 + i * .9, .16, 12.3);

  /* figur kotak: badan, kepala, rambut, tangan, kaki (siap jalan / duduk / mengetik) */
  const hairC = [0x3b2a1e, 0x1a1a2e, 0x8a5a3b, 0x222222, 0x5a3825];
  function figure(col, hi, o = {}) {
    const g = new THREE.Group(), m = new THREE.Group(); g.add(m); sc.add(g);
    box(.52, .7, .3, col, 0, 1.15, 0, m); box(.4, .4, .4, 0xf2c9a0, 0, 1.75, 0, m); box(.44, .15, .44, hairC[hi % 5], 0, 2.0, .02, m); if (o.cap) box(.46, .1, .5, o.cap, 0, 2.06, -.04, m);
    const leg = s => { const p = new THREE.Group(); p.position.set(.13 * s, .8, 0); m.add(p); box(.2, .8, .2, o.pants || 0x1f2a44, 0, -.4, 0, p); box(.22, .1, .3, o.shoes || 0x222222, 0, -.78, -.05, p); return p; };
    const arm = s => { const p = new THREE.Group(); p.position.set(.36 * s, 1.4, 0); m.add(p); box(.14, .5, .14, col, 0, -.22, 0, p); box(.12, .12, .12, 0xf2c9a0, 0, -.52, 0, p); return p; };
    const lL = leg(-1), lR = leg(1), aL = arm(-1), aR = arm(1), cup = box(.12, .14, .12, 0xffffff, 0, -.62, -.1, aR); cup.visible = false;
    return { g, m, lL, lR, aL, aR, cup, ph: 0 };
  }
  function pose(f, k, dt, t) {
    if (k === 'walk') { f.ph += dt * 7; const s = Math.sin(f.ph) * .7; f.lL.rotation.x = s; f.lR.rotation.x = -s; f.aL.rotation.x = -s * .8; f.aR.rotation.x = f.cup.visible ? 1.1 : s * .8; f.m.position.y = Math.abs(Math.sin(f.ph)) * .04; }
    else if (k === 'sit' || k === 'type') { f.m.position.y = -.3; f.lL.rotation.x = f.lR.rotation.x = 1.5; if (k === 'type') { f.aL.rotation.x = 1.15 + Math.sin(t * 9) * .1; f.aR.rotation.x = 1.15 + Math.cos(t * 8) * .1; } else { f.aL.rotation.x = .5; f.aR.rotation.x = f.cup.visible ? 1.2 : .5; } }
    else { f.m.position.y = 0; f.lL.rotation.x = f.lR.rotation.x = 0; f.aL.rotation.x = 0; f.aR.rotation.x = f.cup.visible ? 1.2 : 0; }
  }

  /* meja + agen kantor (posisi sama dengan kantor 3D) */
  const COL = { MANAGER: 0x2b2f3a, COMMERCE: 0xe8643f, LOGISTIK: 0xf0b72a, CREATIVE: 0xa05fc4, 'KONTEN IG': 0xf06fb0, DEVELOPER: 0x5b9cff, QA: 0x2bb89a, SECURITY: 0x5a7088, KEUANGAN: 0x2bb86a };
  const DSK = AGENTS.map(L => [L.role, COL[L.role], L.x, L.z, L.w, L]);
  const AG = DSK.map(([role, col, x, z, w, L], i) => {
    box(w, .08, 1.1, 0xfbf0c9, x, .78, z); [[-1, -.45], [1, -.45], [-1, .45], [1, .45]].forEach(([a, b]) => box(.08, .74, .08, 0xcdbf8f, x + a * (w / 2 - .1), .37, z + b));
    box(.12, .3, .12, 0x24304a, x, .97, z - .2); box(.85, .5, .06, 0x24304a, x, 1.3, z - .2); const face = box(.74, .39, .02, 0x3a5a7a, x, 1.3, z - .16); box(.55, .06, .25, 0xf5f5f5, x + .35, .83, z + .15);
    box(.7, .08, .7, 0x1d3a8a, x, .42, z + .87); box(.7, .75, .08, 0x1d3a8a, x, .85, z + 1.25);
    const fig = figure(col, i, {}); fig.g.position.set(L.seat[0], 0, L.seat[1]); fig.g.rotation.y = 0;
    return { role, x, z, seat: L.seat, L, face, fig, mode: 'desk', path: [], pi: 0, spot: null, idleT: 0, wait: 4 + (i * 1.7) % 5, dwell: 0, w: false, task: '', say: '' };
  });
  const KS = { role: 'KASIR', fig: figure(0x0a0a0a, 3, { cap: 0x0a0a0a, pants: 0x1a1a1a }), px: 5, pz: 2.75, ry: Math.PI, walk: false, note: '', w: false };
  const SB = { role: 'STOK-BOT', fig: figure(0x2f6bff, 1, { cap: 0x2f6bff, shoes: 0xe8ff3a, pants: 0x1a1a1a }), px: -2.6, pz: 3.8, ry: 0, walk: false, note: '', w: false };
  [KS, SB].forEach(q => q.fig.g.position.set(q.px, 0, q.pz));

  /* tempat santai: jalur dari kursi lewat pintu ruangan + koridor (jalur keluar ada di layout.js) */
  const SPOTS = [{ x: 9.6, z: 7.6, ry: Math.PI / 2, pose: 'stand', via: 'KI', say: 'ngopi dulu', cup: 1 }, { x: 11.9, z: 10.5, ry: 0, pose: 'sit', via: 'KI', say: 'istirahat makan', cup: 1 }, { x: 13.1, z: 10.5, ry: 0, pose: 'sit', via: 'KI', say: 'ngobrol santai', cup: 1 }, { x: 12.5, z: 8.7, ry: Math.PI, pose: 'sit', via: 'KI', say: 'ngopi santai', cup: 1 },
    { x: 17.5, z: 11.35, ry: 0, pose: 'sit', via: 'GI', say: 'santai di taman' }, { x: 18.5, z: 11.35, ry: 0, pose: 'sit', via: 'GI', say: 'lihat taman' }, { x: 19.7, z: 8.2, ry: -Math.PI / 2, pose: 'stand', via: 'GI', say: 'cari udara segar' }, { x: 17.4, z: 7.7, ry: Math.PI, pose: 'stand', via: 'GI', say: 'lihat kolam' }];
  const onBreak = () => AG.filter(a => a.mode !== 'desk').length;
  const turn = (f, to, dt) => { let d = to - f.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.g.rotation.y += d * Math.min(1, dt * 10); };
  function leave(a, s) { const nodes = joinPath(a.L.exit, BREAK_EXIT[s.via]); a.path = [a.seat, ...nodes, [s.x, s.z]]; a.back = [[s.x, s.z], ...nodes.slice().reverse(), a.seat]; a.pi = 1; a.spot = s; s.busy = true; a.mode = 'toBreak'; a.say = '→ ' + (s.via === 'KI' ? 'dapur' : 'taman'); }
  function stepAgent(a, dt, t) {
    const f = a.fig, p = f.g.position;
    if (a.away) {                                   // lagi jalan lapor ke ruangan lain (posisi dari office.js)
      if (a.mode !== 'visit') { if (a.spot) a.spot.busy = false; a.spot = null; a.mode = 'visit'; f.cup.visible = false; }
      const q = a.vs, dx = q.x - p.x, dz = q.z - p.z; if (Math.hypot(dx, dz) > .003 && q.mv) turn(f, Math.atan2(-dx, -dz), dt); else if (q.talk && q.to) turn(f, Math.atan2(-(q.to.x - p.x), -(q.to.z - p.z)), dt);
      p.set(q.x, 0, q.z); a.face.material = mt(0x3a5a7a); a.say = q.note; pose(f, q.mv ? 'walk' : 'stand', dt, t); return; }
    if (a.mode === 'visit') { a.mode = 'desk'; a.idleT = 0; a.wait = 4 + Math.random() * 5; p.set(a.seat[0], 0, a.seat[1]); turn(f, 0, dt); }
    if (a.mode === 'desk') {
      a.face.material = mt(a.w ? 0x8fd6ff : 0x3a5a7a); p.set(a.seat[0], 0, a.seat[1]); turn(f, 0, dt); f.cup.visible = false; pose(f, a.w ? 'type' : 'sit', dt, t); a.say = (a.w || a.live) ? a.task : '';
      if (!a.w) { a.idleT += dt; if (a.idleT > a.wait && onBreak() < 3) { const free = SPOTS.filter(s => !s.busy); if (free.length) { leave(a, free[Math.random() * free.length | 0]); a.idleT = 0; } } } else a.idleT = 0; return; }
    a.face.material = mt(0x3a5a7a);
    if (a.mode === 'toBreak' || a.mode === 'toDesk') {
      const w = a.path[a.pi]; if (!w) return; const dx = w[0] - p.x, dz = w[1] - p.z, d = Math.hypot(dx, dz), v = 1.7 * dt; f.cup.visible = false;
      if (d < .08) { a.pi++; if (a.pi >= a.path.length) { if (a.mode === 'toBreak') { a.mode = 'break'; a.dwell = 9 + Math.random() * 8; a.dmax = a.dwell; a.say = a.spot.say; f.cup.visible = !!a.spot.cup; } else { a.mode = 'desk'; a.spot = null; a.idleT = 0; a.wait = 4 + Math.random() * 5; } } }
      else { p.x += dx / d * v; p.z += dz / d * v; turn(f, Math.atan2(-dx, -dz), dt); pose(f, 'walk', dt, t); } return; }
    if (a.mode === 'break') { turn(f, a.spot.ry, dt); f.cup.visible = !!a.spot.cup; p.set(a.spot.x, 0, a.spot.z); pose(f, a.spot.pose === 'sit' ? 'sit' : 'stand', dt, t); a.dwell -= dt;
      if (a.dwell <= 0 || (a.w && a.dmax - a.dwell > 4)) { a.spot.busy = false; a.path = a.back; a.pi = 1; a.mode = 'toDesk'; a.say = '→ meja kerja'; f.cup.visible = false; } }
  }
  function stepWalker(q, S, dt, t) {
    const f = q.fig, p = f.g.position, dx = S.x - q.px, dz = S.z - q.pz; q.w = !!S.w; q.note = S.note || '';
    if (Math.hypot(dx, dz) > .003) q.ry = Math.atan2(-dx, -dz); else if (q.role === 'KASIR') q.ry = S.st === 'talk' ? Math.PI / 2 : Math.PI;
    q.px = S.x; q.pz = S.z; p.set(S.x, 0, S.z); turn(f, q.ry, dt); pose(f, S.mv ? 'walk' : 'stand', dt, t);
  }

  /* label + kartu statistik */
  const ENT = [...AG, KS, SB], pills = ENT.map(e => { const p = document.createElement('div'); p.className = 'tv-pill' + (e.role === 'MANAGER' ? ' mgr' : ''); const b = document.createElement('div'); b.className = 'tv-bub'; labs.append(b, p); if (e.role === 'MANAGER') p.onclick = () => openRep(false); return { p, b }; });
  const fmt = n => Number(n || 0).toLocaleString('id-ID'); let S = null, stT = 0;
  function openRep(ai) { repEl.hidden = false; repPre.textContent = 'Menyusun laporan…'; report && report(ai).then(t => { repPre.textContent = t; }).catch(e => { repPre.textContent = 'Gagal: ' + e.message; }); }
  repEl.querySelector('[data-x]').onclick = () => { repEl.hidden = true; }; repEl.querySelector('[data-ai]').onclick = () => openRep(true);
  function pull() {
    S = getState && getState(); if (!S) return; S.agents.forEach(q => { const a = AG.find(z => z.role === q.role); if (a) { a.w = !!q.w; a.task = q.task || ''; a.live = !!q.live; } });
    const act = S.agents.filter(q => q.w).length + S.walkers.filter(q => q.w).length, brk = AG.filter(a => a.mode === 'break').length;
    cards.innerHTML = [['Agen aktif', act + '/11'], ['Istirahat', brk], ['Token', fmt(S.tok)], ['Biaya hari ini', 'Rp 0']].map(([k, v]) => `<div class="tv-card"><small>${k}</small><b>${v}</b></div>`).join('');
    ENT.forEach((e, i) => { const on = e.role === 'KASIR' || e.role === 'STOK-BOT' ? e.w : (e.mode === 'desk' ? e.w : false), br = e.mode === 'break'; pills[i].p.innerHTML = `<i style="background:${on ? '#3ddc84' : br ? '#f0b72a' : '#777'}"></i>${e.role}`; });
  }

  /* kamera orbit */
  const O = { th: .55, ph: .95, rad: 40, tx: 10, ty: 0, tz: 3 }, ptr = new Map(); let pd = 0, pm = null;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), K = () => cam.aspect < 1 ? 1.4 : 1;
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]); pd = 0; pm = null; });
  const up = e => { ptr.delete(e.pointerId); pd = 0; pm = null; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointermove', e => {
    const o = ptr.get(e.pointerId); if (!o) return; const n = [e.clientX, e.clientY];
    if (ptr.size === 1) { O.th -= (n[0] - o[0]) * .007; O.ph = clamp(O.ph - (n[1] - o[1]) * .005, .35, 1.35); ptr.set(e.pointerId, n); return; }
    ptr.set(e.pointerId, n); const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (pd) { O.rad = clamp(O.rad * pd / d, 8, 80); const s = O.rad * K() * .0016, dx = mid[0] - pm[0], dy = mid[1] - pm[1], rx = Math.cos(O.th), rz = -Math.sin(O.th), fx = -Math.sin(O.th), fz = -Math.cos(O.th);
      O.tx = clamp(O.tx + (-rx * dx + fx * dy) * s, -8, 28); O.tz = clamp(O.tz + (-rz * dx + fz * dy) * s, -6, 13); } pd = d; pm = mid;
  });
  cv.addEventListener('wheel', e => { e.preventDefault(); O.rad = clamp(O.rad * (1 + e.deltaY * .001), 8, 80); }, { passive: false });

  let W = 0, H = 0, t = 0; const v3 = new THREE.Vector3();
  return {
    isOn: () => !wrap.hidden,
    setActive(on) { if (on === !wrap.hidden) return; wrap.hidden = !on; if (on) { stT = 0; W = 0; } },
    frame(dt) {
      if (wrap.hidden) return; dt = Math.min(dt, .1); t += dt; syncRacks(); const st = getState && getState(); if (st) { S = st; st.walkers.forEach(q => stepWalker(q.role === 'KASIR' ? KS : SB, q, dt, t)); }
      stT -= dt; if (stT <= 0) { stT = .6; pull(); }
      if (st) st.agents.forEach(q => { const a = AG.find(z => z.role === q.role); if (a) { a.away = !!q.away; a.vs = q.away ? { x: q.x, z: q.z, mv: q.mv, talk: q.talk, note: q.note, to: { x: q.tx, z: q.tz } } : null; } });
      AG.forEach(a => { stepAgent(a, dt, t); if (a.mode === 'break' || a.mode === 'toBreak' || a.mode === 'toDesk') { const fo = window.fvckOffice; if (fo && fo.markBreak) fo.markBreak(a.role); } });   // office.js tidak memanggil agen yang sedang istirahat
      const w = wrap.clientWidth, h = wrap.clientHeight; if (w !== W || h !== H) { W = w; H = h; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
      const R = O.rad * K(), sp = Math.sin(O.ph), cp = Math.cos(O.ph);
      cam.position.set(O.tx + Math.sin(O.th) * sp * R, O.ty + cp * R, O.tz + Math.cos(O.th) * sp * R); cam.lookAt(O.tx, O.ty, O.tz);
      ENT.forEach((e, i) => { const P = pills[i], g = e.fig.g.position; v3.set(g.x, 2.5, g.z).project(cam); const vis = v3.z < 1 && v3.z > -1, px = (v3.x * .5 + .5) * w, py = (-v3.y * .5 + .5) * h;
        let txt = e.role === 'KASIR' || e.role === 'STOK-BOT' ? e.note : e.say; if (e.role === 'MANAGER' && e.mode === 'desk' && S && S.mgrNote) txt = '📋 ' + S.mgrNote;
        P.p.style.display = vis ? '' : 'none'; P.p.style.left = px + 'px'; P.p.style.top = py + 'px'; P.b.style.left = px + 'px'; P.b.style.top = (py - 24) + 'px'; P.b.style.display = vis && txt ? '' : 'none'; if (P.b.textContent !== txt) P.b.textContent = txt || ''; });
      r.render(sc, cam);
    }
  };
}
