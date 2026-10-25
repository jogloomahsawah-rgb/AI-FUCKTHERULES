/* AI OFFICE — di sisi kanan toko, tersambung lewat pintu di dinding kanan (x=8.1, z=1.6).
   Dibagi jadi ruangan per divisi (MANAGER, OPERASIONAL, MARKETING, DEVELOPMENT, RAPAT) dengan koridor di tengah.
   Agen saling samper jalan kaki untuk lapor (daftar di layout.js). Ada juga KASIR-AI dan STOK-BOT. Data = produk publik toko. */
import { WORKER, WORKER_OK } from './config.js?v=1';
import { getToken, A } from './aichat.js?v=1';
import { ROOMS, DOORS, AGENTS, WALLS, joinPath, LINKS, OFFICE_X2 } from './layout.js?v=2';

export function buildOffice(X) {
  const { THREE, scene, M, ctex, tm, T, bx, pln, makeHuman, animHuman, say, S, toast, getHangers, getSolids, lightsQ, SPOTS, STATIC, CM } = X;
  const X0 = 8.2, X1 = OFFICE_X2, CX = (X0 + X1) / 2, W = X1 - X0;
  const black = M({ color: 0x0c0c0c, roughness: .7 }), metal = M({ color: 0x151515, metalness: .8, roughness: .35 });
  const basic = c => new THREE.MeshBasicMaterial({ color: c });
  const sign = txt => new THREE.MeshBasicMaterial({ fog: false, map: ctex(512, 128, (c, w, h) => { c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f2f2f2'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#e8ff3a'; c.textAlign = 'center'; c.font = '900 60px Impact, sans-serif'; c.fillText(txt, w / 2, h / 2 + 21); }) });

  const woodM = tm(T.wood, 2.6, 1.3, 1.2, { r: .6 });
  /* lantai, plafon, dinding */
  const fT = ctex(256, 256, (c, w) => { c.fillStyle = '#b98a5a'; c.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ad7f50' : '#c1935f'; c.fillRect(0, i * 32, w, 30); c.fillStyle = '#8a6038'; c.fillRect(0, i * 32 + 30, w, 2); } });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, 12.2), tm(fT, W, 12.2, 2.5, { r: .8 })); fl.rotation.x = -Math.PI / 2; fl.position.set(CX, 0, 0); fl.receiveShadow = true; scene.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(W, 12.2), M({ color: 0xefede8, roughness: 1 })); ce.rotation.x = Math.PI / 2; ce.position.set(CX, 3.4, 0); scene.add(ce);
  [[11.4, -3], [17.8, -3], [24.3, -3], [11, 1.6], [16, 1.6], [21, 1.6], [26, 1.6], [12.5, 4.4], [16.5, 4.4], [23, 4.4]].forEach(([x, z]) => bx(1.6, .04, .2, basic(0xfff6e8), x, 3.3, z, { rs: false }));
  bx(W, 3.6, .2, tm(T.wall, W, 3.6, 2), CX, 1.8, -6.1);
  bx(.2, 3.6, 12.4, tm(T.wall, 12.4, 3.6, 2), X1 + .1, 1.8, 0);
  bx(W, 3.6, .2, tm(T.brick, W, 3.6, 1.6, { bump: 2, r: .95 }), CX, 1.8, 6.1);
  [11, 15, 19, 23, 26].forEach(x => { bx(1.7, 1.3, .06, metal, x, 1.9, 5.97); pln(1.6, 1.2, basic(0xbfe4fb), x, 1.9, 5.93, Math.PI); });
  { const im = new Image(); im.onload = () => {            // mural graffiti FVCK THE RULES (sama dengan toko)
      const t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true;
      const mw = 8, mh = mw * im.height / im.width, m = new THREE.Mesh(new THREE.PlaneGeometry(mw, mh), M({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.position.set(CX + 1.5, 2.15, -5.99); scene.add(m); }; im.src = 'mural.png'; }
  pln(3.2, .8, sign('AI OFFICE'), X1 - .02, 2.6, 0, -Math.PI / 2);
  /* pintu (dinding kanan toko) */
  [.9, 2.3].forEach(z => bx(.3, 2.5, .1, metal, 8.1, 1.25, z));
  pln(1.2, .3, sign('OFFICE'), 7.98, 2.85, 1.6, -Math.PI / 2); pln(1.2, .3, sign('STORE'), 8.22, 2.85, 1.6, Math.PI / 2);
  bx(.05, 2.4, 1.3, M({ color: 0x2a2a2e, roughness: .6 }), 8.45, 1.2, 3.0);
  /* lampu bertingkat: HP / kualitas rendah cukup 2 lampu (lebih terang), kualitas tinggi 4 lampu supaya tiap ruangan merata */
  [[12.8, -2.2, 1, 26, 15], [22.5, -1.0, 1, 26, 15], [11, 4.4, 2, 15, 15], [21, 4.2, 2, 15, 15]].forEach(([x, z, mq, lo, hi]) => { const l = new THREE.PointLight(0xfff1e0, hi, 14, 2); l.position.set(x, 3, z); l.userData.lo = lo; l.userData.hi = hi; scene.add(l); lightsQ.push([l, mq]); });

  /* meja + agen */
  const chairM = M({ color: 0x1d3a8a, roughness: .8 });
  const chair = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    bx(.46, .07, .46, chairM, 0, .43, 0, { p: g, rs: false }); bx(.46, .46, .06, chairM, 0, .72, .23, { p: g, rs: false }); bx(.06, .4, .06, metal, 0, .2, 0, { p: g, rs: false });
    bx(.56, .04, .06, metal, 0, .04, 0, { p: g, rs: false }); bx(.06, .04, .56, metal, 0, .04, 0, { p: g, rs: false }); return g; };
  const own = { p: scene };
  const desk = (x, z, w = 2.2) => { bx(w, .07, 1, woodM, x, .8, z, { cs: true }); [-1, 1].forEach(s => [-.4, .4].forEach(d => bx(.06, .76, .06, metal, x + s * (w / 2 - .1), .38, z + d)));
    bx(.5, .36, .04, black, x, 1.12, z - .2); bx(.05, .2, .05, black, x, .92, z - .2); bx(.45, .02, .16, black, x, .85, z + .15);
    const sc = bx(.44, .28, .01, basic(0x3a5a7a), x, 1.12, z - .17, own); STATIC.push([x - w / 2, z - .5, x + w / 2, z + .5]); return sc; };
  /* ruangan: karpet per divisi, sekat (bawah padat, atas kaca), rangka pintu + papan nama */
  ROOMS.forEach(r => bx(r.x2 - r.x1 - .8, .04, r.z2 - r.z1 - .8, M({ color: r.rug, roughness: 1 }), (r.x1 + r.x2) / 2, .03, (r.z1 + r.z2) / 2, { rs: false }));
  const glass = new THREE.MeshBasicMaterial({ color: 0xbfe4fb, transparent: true, opacity: .16, depthWrite: false });
  WALLS.forEach(([x1, z1, x2, z2]) => { const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, w = Math.max(Math.abs(x2 - x1), .2), d = Math.max(Math.abs(z2 - z1), .2), L = Math.max(w, d);
    bx(w, 1.1, d, tm(T.wall, L, 1.1, 2), cx, .55, cz); bx(w, 1.9, d, glass, cx, 2.05, cz, { rs: false }); bx(w, .1, d, metal, cx, 3.05, cz, { rs: false });
    STATIC.push([Math.min(x1, x2) - .1, Math.min(z1, z2) - .1, Math.max(x1, x2) + .1, Math.max(z1, z2) + .1]); });
  DOORS.forEach(d => { [-1, 1].forEach(sg => bx(.08, 2.4, .24, metal, d.x + sg * d.w / 2, 1.2, d.z)); bx(d.w, .12, .24, metal, d.x, 2.4, d.z);
    pln(1.6, .4, sign(d.name), d.x, 2.78, d.z + d.side * .13, d.side > 0 ? 0 : Math.PI); });
  /* RAPAT: meja besar + 6 kursi + papan tulis (hiasan) */
  { const rx = 23.0, rz = 4.4; bx(3.2, .07, 1.2, woodM, rx, .76, rz, { cs: true }); [-1.4, 1.4].forEach(a => [-.5, .5].forEach(b => bx(.06, .72, .06, metal, rx + a, .36, rz + b))); STATIC.push([rx - 1.6, rz - .6, rx + 1.6, rz + .6]);
    [[-.8, -1], [.8, -1], [-.8, 1], [.8, 1], [-2.0, 0], [2.0, 0]].forEach(([a, b]) => chair(rx + a, rz + b * .95, b === 0 ? (a < 0 ? -Math.PI / 2 : Math.PI / 2) : (b < 0 ? Math.PI : 0)));
    pln(2.8, 1.1, basic(0xf4f4f4), X1 - .03, 1.8, rz, -Math.PI / 2); }
  const mkLab = () => { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); s.scale.set(1.6, .4, 1);
    s.draw = (a, b, on) => { const g = c.getContext('2d'); g.clearRect(0, 0, 512, 128); g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#f2f2f2'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 122);
      g.fillStyle = on ? '#3ddc84' : '#777'; g.beginPath(); g.arc(34, 64, 13, 0, 7); g.fill(); g.fillStyle = '#f2f2f2'; g.textAlign = 'left'; g.font = '900 44px Impact, sans-serif'; g.fillText(a, 62, 58); g.fillStyle = '#bbb'; g.font = '26px monospace'; g.fillText(b || '', 62, 100); t.needsUpdate = true; };
    scene.add(s); return s; };
  const INFO = { MANAGER: [0x0a0a0a, ['Merangkum laporan agen', 'Menyusun laporan untuk admin', 'Cek antrean approval']],
    COMMERCE: [0xd9482b, ['Cek order belum lunas', 'Rekap pembayaran', 'Cek resi']], LOGISTIK: [0xe3a008, ['Cek resi J&T', 'Hitung ongkir', 'Update pengiriman']],
    CREATIVE: [0x8e44ad, ['Tulis caption IG', 'Susun hashtag', 'Brief desain']], 'KONTEN IG': [0xe84393, ['Kalender konten', 'Jadwalkan draft', 'Riset tren']],
    DEVELOPER: [0x2f6bff, ['Review kode', 'Siapkan patch', 'Cek bug checkout']], QA: [0x16a085, ['Tes alur checkout', 'Tes login', 'Cek regresi']],
    SECURITY: [0x2c3e50, ['Cek aturan Firestore', 'Audit akses', 'Scan API key']] };
  const AGS = AGENTS.map((L, i) => {
    const [col, tasks] = INFO[L.role], scr = desk(L.x, L.z, L.w), ch = chair(L.seat[0], L.seat[1] + .02), h = makeHuman({ top: col, pants: 0x1a1a1a, shoes: 0x111111 }); h.g.position.set(L.seat[0], 0, L.seat[1]); h.g.rotation.y = Math.PI; scene.add(h.g);
    const l = mkLab(); l.position.set(L.seat[0], 2.45, L.seat[1]); const a = { role: L.role, L, tasks, scr, h, l, w: false, task: '', i, v: null, walk: 0, mv: false };
    SPOTS.push({ id: 'ag' + i, x: L.vis[0], z: L.vis[1], lim: 1.3, t: i === 0 ? 'PRESS E · MANAGER · LAPORAN' : `PRESS E · ${L.role} (AI)`, go: () => i === 0 ? mgrOpen() : say(L.role + ' · AI · ' + L.room, (a.v ? 'Sedang jalan: ' + a.v.txt + ' ke ' + a.v.to.role : a.w ? 'Sedang: ' + a.task : live ? a.task : 'Standby.') + '\n\n' + (live ? (a.det ? a.det + '\n\n' : '') + 'Status dari Worker (jadwal nyata). Aktivitas santai hanya hiburan kantor.' : 'Status agen di kantor ini masih simulasi.') + '') });
    return a; });
  let live = false;   // true setelah status nyata dari Worker berhasil dibaca
  const setA = (a, w, task) => { a.w = w; a.task = task || a.tasks[Math.random() * a.tasks.length | 0]; a.scr.material.color.set(w ? 0x7fd0ff : 0x3a5a7a); a.l.draw(a.role, (w || live) ? a.task.slice(0, 22) : 'standby', w); };
  AGS.forEach((a, i) => setA(a, i < 3));
  const pollLive = async () => { if (!WORKER_OK) return; try { const r = await fetch(WORKER + '/status'); if (!r.ok) return; const j = await r.json(); live = true;
    (j.agents || []).forEach(q => { const a = AGS.find(z => z.role === (q.role === 'ORCHESTRATOR' ? 'MANAGER' : q.role)); if (a && !a.v) { a.det = q.emoji + ' ' + q.ket; setA(a, q.mode === 'kerja', q.aktivitas); } }); } catch { } };
  pollLive(); setInterval(pollLive, 60000);
  window.fvckOffice = { markBreak: role => { brk[role] = performance.now(); }, report: ai => ai ? mgrAI() : Promise.resolve(mgrText()), update: (role, o) => { if (role === 'ORCHESTRATOR') role = 'MANAGER'; const a = AGS.find(q => q.role === role); if (a) setA(a, o.status === 'working', o.task); } };

  /* papan status di dinding */
  const bc = document.createElement('canvas'); bc.width = 512; bc.height = 160; const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace; let tok = 0;
  pln(2.6, .8, new THREE.MeshBasicMaterial({ map: bt, fog: false }), 10.8, 2.7, -5.97, 0);
  const drawB = () => { const g = bc.getContext('2d'), n = AGS.filter(a => a.w).length + (bs.wait <= 0 ? 1 : 0) + (ks.st !== 'idle' ? 1 : 0); g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 512, 160); g.strokeStyle = '#f2f2f2'; g.lineWidth = 6; g.strokeRect(4, 4, 504, 152);
    g.fillStyle = '#e8ff3a'; g.font = '900 40px Impact, sans-serif'; g.textAlign = 'left'; g.fillText('AGEN AKTIF ' + n + '/10', 24, 56); g.fillStyle = '#f2f2f2'; g.font = '26px monospace'; g.fillText('TOKEN ' + tok.toLocaleString('id-ID') + ' · RP 0', 24, 100); g.fillStyle = '#888'; g.font = '20px monospace'; g.fillText('DEMO · BUKAN DATA NYATA', 24, 138); bt.needsUpdate = true; };

  /* laporan dari data produk publik toko */
  const rep = () => { const P = S.products || [], A = S.acc || [], c = b => P.filter(p => p.badge === b).length, low = P.filter(p => p.badge === 'ready' && p.stock.length <= 1).map(p => p.name);
    return `Kaos: ${P.length} (ready ${c('ready')} · PO ${c('pre')} · arsip ${c('sold')}). Aksesoris: ${A.length}.\n` + (low.length ? 'Ukuran hampir habis: ' + low.slice(0, 5).join(', ') + '.' : 'Tidak ada ready stock yang ukurannya tinggal 1.'); };
  async function orderRep() {
    if (!WORKER_OK) return say('LAPORAN ORDER', 'URL Worker belum diisi di config.js (lihat panduan).');
    if (!A.ok) return say('LAPORAN ORDER', 'Login admin dulu.');
    say('LAPORAN ORDER', 'Menghitung...');
    try { const r = await fetch(WORKER + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await getToken() }, body: JSON.stringify({ readonly: true, messages: [{ role: 'user', text: 'Ringkas order: jumlah per status dan yang belum lunas. Singkat.' }] }) });
      const j = await r.json(); say('LAPORAN ORDER', j.reply || 'Error: ' + j.error); } catch (e) { say('LAPORAN ORDER', 'Gagal: ' + e.message); } }
  /* KASIR-AI: berdiri di kasir toko, lalu berjalan ke kantor untuk melapor ke MANAGER */
  const kl = mkLab(); kl.draw('KASIR-AI', 'jaga kasir', true);
  const HOME = { x: 5, z: 2.75 };
  const GO = [HOME, { x: 6.9, z: 2.75 }, { x: 7.3, z: 1.6 }, { x: 9.6, z: 1.6 }, ...AGENTS[0].exit.slice().reverse().map(([x, z]) => ({ x, z }))];   // lewat koridor, masuk pintu ruang MANAGER
  const ks = { st: 'idle', t: 8, i: 0, walk: 0, mv: false, rep: 0, inbox: 0 };
  const kp = CM.g.position, kSpot = { id: 'laporan', x: HOME.x, z: HOME.z, lim: 1.6, t: 'PRESS E · KASIR-AI · LAPORAN', go: () => say('KASIR-AI · LAPORAN', rep(), [['LAPORAN ORDER', orderRep], ['TUTUP']]) };
  SPOTS.push(kSpot);
  function kasirTick(dt) {
    ks.mv = false;
    if (ks.st === 'idle') { ks.t -= dt; CM.g.rotation.y = Math.sin(ks.walk * .05) * .0; if (ks.t <= 0) { ks.st = 'out'; ks.i = 1; kl.draw('KASIR-AI', 'lapor ke manager', true); } }
    else if (ks.st === 'out' || ks.st === 'back') {
      const w = GO[ks.i], dx = w.x - kp.x, dz = w.z - kp.z, d = Math.hypot(dx, dz), v = 1.5 * dt;
      if (d < .12) { if (ks.st === 'out') { if (ks.i === GO.length - 1) { ks.st = 'talk'; ks.t = 6; ks.inbox = Date.now(); logRep('KASIR-AI → MANAGER: laporan penjualan'); toast('MANAGER: laporan kasir masuk. Tekan E pada MANAGER untuk membaca.'); CM.g.rotation.y = -Math.PI / 2; const m = rep().split('\n')[0]; kl.draw('LAPORAN', m.slice(0, 30), true); } else ks.i++; } else { if (ks.i === 0) { ks.st = 'idle'; ks.t = 20 + Math.random() * 15; CM.g.rotation.y = 0; kl.draw('KASIR-AI', 'jaga kasir', true); } else ks.i--; } }
      else { kp.x += dx / d * v; kp.z += dz / d * v; ks.mv = true; ks.walk += dt * 7; CM.g.rotation.y = Math.atan2(dx, dz); } }
    else if (ks.st === 'talk') { ks.t -= dt; if (ks.t <= 0) { ks.st = 'back'; ks.i = GO.length - 2; kl.draw('KASIR-AI', 'balik ke kasir', true); } }
    animHuman(CM, ks.walk, ks.mv); if (ks.st === 'talk') { CM.aR.rotation.x = -1.2 + Math.sin(ks.walk + performance.now() / 150) * .25; }
    kl.position.set(kp.x, 2.35, kp.z); kSpot.x = kp.x; kSpot.z = kp.z; }

  /* SAMPER: agen berdiri, jalan kaki lewat pintu + koridor ke meja agen lain, lapor sebentar, lalu balik. */
  const LOG = [], by = r => AGS.find(q => q.role === r), hhmm = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const logRep = m => { LOG.unshift(hhmm() + ' ' + m); LOG.length = Math.min(LOG.length, 5); };
  const brk = {}, onBreak = a => performance.now() - (brk[a.role] || -1e9) < 700;   // diisi topview tiap frame selama agen di dapur / taman
  let visitT = 5;
  const startVisit = (a, b, txt) => { a.v = { st: 'out', p: [a.L.seat, ...joinPath(a.L.exit, b.L.exit)], i: 1, t: 0, to: b, txt }; a.scr.material.color.set(0x3a5a7a); a.l.draw(a.role, 'ke ' + b.role.toLowerCase(), true); };
  const faceXZ = (g, x, z) => { g.rotation.y = Math.atan2(x - g.position.x, z - g.position.z); };
  function visitTick(dt) {
    visitT -= dt;
    if (visitT <= 0) { visitT = 6 + Math.random() * 7;
      if (AGS.filter(q => q.v).length < 3) { const [f, t, txt] = LINKS[Math.random() * LINKS.length | 0], a = by(f), b = by(t); if (a && b && !a.v && !b.v && !onBreak(a) && !onBreak(b)) startVisit(a, b, txt); } }
    AGS.forEach(a => { const v = a.v; a.mv = false; if (!v) return; const p = a.h.g.position;
      if (v.st === 'out' || v.st === 'back') {
        const w = v.p[v.i], dx = w[0] - p.x, dz = w[1] - p.z, d = Math.hypot(dx, dz);
        if (d < .1) { v.i += v.st === 'out' ? 1 : -1;
          if (v.st === 'out' && v.i >= v.p.length) { v.st = 'talk'; v.t = 5; a.l.draw(a.role, v.txt, true); logRep(a.role + ' → ' + v.to.role + ': ' + v.txt); }
          else if (v.st === 'back' && v.i < 0) { a.v = null; p.set(a.L.seat[0], 0, a.L.seat[1]); a.h.g.rotation.y = Math.PI; setA(a, a.w, a.task); } }
        else { const k = 1.5 * dt; p.x += dx / d * k; p.z += dz / d * k; a.mv = true; a.walk += dt * 7; a.h.g.rotation.y = Math.atan2(dx, dz); }
      } else { v.t -= dt; a.h.L.rotation.x = a.h.R.rotation.x = 0; a.h.g.position.y = 0; faceXZ(a.h.g, v.to.L.seat[0], v.to.L.seat[1]); a.h.aR.rotation.x = -1.2 + Math.sin(performance.now() / 150) * .25; if (v.t <= 0) { v.st = 'back'; v.i = v.p.length - 2; a.l.draw(a.role, 'balik ke meja', true); } }
      if (v.st !== 'talk') animHuman(a.h, a.walk, a.mv); a.l.position.set(p.x, 2.45, p.z); });
    /* tuan rumah menoleh ke tamu yang sedang bicara */
    AGS.forEach(b => { if (b.v) return; const g = AGS.find(q => q.v && q.v.st === 'talk' && q.v.to === b); let tx = null;
      if (g) tx = g.h.g.position; else if (b.role === 'MANAGER' && ks.st === 'talk') tx = kp;
      if (tx) faceXZ(b.h.g, tx.x, tx.z); else b.h.g.rotation.y = Math.PI; });
  }

  /* MANAGER: merangkum laporan agen + kasir + stok, lalu melapor ke admin (kamu) */
  function mgrText() {
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'), w = AGS.filter(a => a.w), n = w.length + (bs.wait <= 0 ? 1 : 0) + (ks.st !== 'idle' ? 1 : 0);
    return `LAPORAN MANAGER · ${now}\n\nAgen aktif ${n}/10.\n` + (w.length ? w.map(a => '• ' + a.role + ': ' + a.task).join('\n') : '• Agen kantor semua standby.') + `\n• KASIR: ${ks.st === 'idle' ? 'jaga kasir' : 'sedang melapor'}\n• STOK-BOT: ${bs.cur ? 'terakhir cek ' + bs.cur.p.name : 'patroli'}\n\nLaporan masuk terakhir:\n${LOG.length ? LOG.map(x => '• ' + x).join('\n') : '• Belum ada.'}\n\nStok toko (data asli):\n${rep()}\n\n${live ? 'Status agen diambil dari Worker (jadwal nyata).' : 'Catatan: status agen masih simulasi.'}`;
  }
  async function mgrAI() {
    if (!WORKER_OK) return 'URL Worker belum diisi di config.js, jadi ringkasan AI belum bisa dibuat.\n\n' + mgrText();
    if (!A.ok) return 'Login admin dulu.';
    try { const r = await fetch(WORKER + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await getToken() }, body: JSON.stringify({ readonly: true, messages: [{ role: 'user', text: 'Kamu MANAGER AI. Laporkan ke pemilik toko dalam 4 poin singkat: order per status dan yang belum lunas, stok menipis, kondisi agen, saran tindakan. Jangan mengarang angka.\n\nData lokal:\n' + mgrText() }] }) });
      const j = await r.json(); return j.reply || 'Error: ' + j.error; } catch (e) { return 'Gagal: ' + e.message; } }
  function mgrOpen() { say('MANAGER · LAPORAN', mgrText(), [['RINGKAS DENGAN AI', async () => { say('MANAGER', 'Menyusun ringkasan…'); say('MANAGER · RINGKASAN AI', await mgrAI()); }], ['TUTUP']]); }

  /* STOK-BOT: patroli di toko, cek hanger satu per satu */
  const bot = makeHuman({ top: 0x2f6bff, pants: 0x1a1a1a, shoes: 0xe8ff3a, cap: 0x2f6bff }); bot.g.position.set(-2.6, 0, 3.8); scene.add(bot.g);
  const bl = mkLab(); scene.add(bl); bl.draw('STOK-BOT', 'mulai patroli', true);
  var bs = { tgt: null, wait: 1, cur: null, walk: 0, mv: false, tm: 0 };
  const botSpot = { id: 'stokbot', x: -2.6, z: 3.8, lim: 1.7, t: 'PRESS E · STOK-BOT (AI)', go: () => { const q = bs.cur && bs.cur.p;
    say('STOK-BOT · AI', (q ? `Terakhir cek: ${q.name}\nStatus: ${({ ready: 'READY STOCK', pre: 'PRE ORDER', sold: 'ARSIP' })[q.badge] || q.badge}\nUkuran tersedia: ${q.stock.join(' / ') || '-'}\n\n` : '') + rep(), [['TUTUP']]); } };
  SPOTS.push(botSpot);
  function botTick(dt) {
    const p = bot.g.position, H = getHangers(); bs.mv = false;
    if (bs.wait > 0) bs.wait -= dt;
    else { if (!bs.tgt && H.length) { bs.cur = H[Math.random() * H.length | 0]; bs.tgt = { x: bs.cur.x, z: bs.cur.z + .95 }; bs.tm = 0; }
      if (bs.tgt) { const dx = bs.tgt.x - p.x, dz = bs.tgt.z - p.z, d = Math.hypot(dx, dz); bs.tm += dt;
        if (d < .2 || bs.tm > 14) { bs.wait = 3.5; bs.tgt = null; const q = bs.cur.p; bl.draw('CEK ' + q.name.slice(0, 14).toUpperCase(), 'ukuran: ' + (q.stock.join('/') || '-'), true); }
        else { const v = 1.3 * dt; p.x += dx / d * v; p.z += dz / d * v; bs.mv = true; bot.g.rotation.y = Math.atan2(dx, dz); bs.walk += dt * 7;
          for (const [a, b, c, e] of getSolids()) { const nx = Math.max(a, Math.min(p.x, c)), nz = Math.max(b, Math.min(p.z, e)), ex = p.x - nx, ez = p.z - nz, ds = Math.hypot(ex, ez); if (ds < .35 && ds > 1e-4) { p.x = nx + ex / ds * .35; p.z = nz + ez / ds * .35; } } } } }
    animHuman(bot, bs.walk, bs.mv); bl.position.set(p.x, 2.35, p.z); botSpot.x = p.x; botSpot.z = p.z; }

  const nearWall = (x, z) => { for (const [a, b, c, d] of WALLS) if (x > Math.min(a, c) - .32 && x < Math.max(a, c) + .32 && z > Math.min(b, d) - .32 && z < Math.max(b, d) + .32) return true; return false; };
  setInterval(() => { const a = AGS[Math.random() * AGS.length | 0]; if (live || a.v) return; setA(a, !a.w); tok += AGS.filter(q => q.w).length * (40 + Math.random() * 60 | 0); drawB(); }, 1800); drawB();
  return {
    solids: [], state: () => ({ tok, mgrNote: ks.st === 'talk' ? 'menerima laporan kasir' : (Date.now() - ks.inbox < 60000 && ks.inbox ? 'laporan siap dibaca' : ''), agents: AGS.map(a => ({ role: a.role, live, w: a.w, task: a.task, away: !!a.v, x: a.h.g.position.x, z: a.h.g.position.z, mv: a.mv, talk: !!a.v && a.v.st === 'talk', tx: a.v ? a.v.to.L.seat[0] : 0, tz: a.v ? a.v.to.L.seat[1] : 0, note: a.v ? (a.v.st === 'back' ? 'balik ke meja' : a.v.txt + ' → ' + a.v.to.role) : '' })), walkers: [{ role: 'KASIR', x: kp.x, z: kp.z, mv: ks.mv, st: ks.st, w: ks.st !== 'idle', note: ({ idle: 'jaga kasir', out: 'lapor ke manager', talk: 'melapor ke manager', back: 'balik ke kasir' })[ks.st] }, { role: 'STOK', x: bot.g.position.x, z: bot.g.position.z, mv: bs.mv, w: bs.wait <= 0, note: bs.cur ? 'cek ' + bs.cur.p.name.slice(0, 16) : 'patroli stok' }] }), update(t, dt) { visitTick(dt); AGS.forEach(a => { if (a.v) return; const w = a.w ? 1 : 0; a.h.g.position.y = -.36; a.h.L.rotation.x = a.h.R.rotation.x = -1.45;   // duduk di kursi
        a.h.aL.rotation.x = w ? -1.15 + Math.sin(t * 10 + a.i) * .1 : -.5; a.h.aR.rotation.x = w ? -1.15 + Math.cos(t * 9 + a.i) * .1 : -.5; }); kasirTick(dt); botTick(dt); },
    inside: (x, y, z) => y > .3 && y < 3.2 && ((x > 8.3 && x < X1 - .1 && z > -5.9 && z < 5.9 && !nearWall(x, z)) || (x > 7.75 && x <= 8.3 && z > 1 && z < 2.2)),
    clamp(p, RW, RZN, RZP) {
      const inDoor = p.z > 1 && p.z < 2.2; p.x = Math.max(-RW + .1, Math.min(X1 - .6, p.x));
      if (!inDoor) p.x = this.side ? Math.max(p.x, 8.3) : Math.min(p.x, RW - .1);
      if (p.x > 7.95) this.side = true; else if (p.x < 7.5) this.side = false;
      p.z = Math.max(RZN + .1, Math.min(RZP, p.z)); if (p.x > RW - .1 && p.x < 8.3) p.z = Math.max(1, Math.min(2.2, p.z)); }, side: false };
}
