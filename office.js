/* AI OFFICE — ruangan kedua di sisi kanan toko, tersambung lewat pintu di dinding kanan (x=8.1, z=1.6).
   Isi: 8 agen AI di meja, KASIR-AI (laporan), dan STOK-BOT yang patroli di toko. Data = produk publik toko. */
const AI_WORKER = '';   // opsional: URL Worker (mis. https://fvck-ai.xxx.workers.dev) untuk laporan ORDER (khusus admin)

export function buildOffice(X) {
  const { THREE, scene, M, ctex, tm, T, bx, pln, makeHuman, animHuman, say, S, getHangers, getSolids, lightsQ, SPOTS, STATIC } = X;
  const X0 = 8.2, X1 = 22, CX = (X0 + X1) / 2, W = X1 - X0;
  const black = M({ color: 0x0c0c0c, roughness: .7 }), metal = M({ color: 0x151515, metalness: .8, roughness: .35 });
  const basic = c => new THREE.MeshBasicMaterial({ color: c });
  const sign = txt => new THREE.MeshBasicMaterial({ fog: false, map: ctex(512, 128, (c, w, h) => { c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f2f2f2'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#e8ff3a'; c.textAlign = 'center'; c.font = '900 60px Impact, sans-serif'; c.fillText(txt, w / 2, h / 2 + 21); }) });

  /* lantai, plafon, dinding */
  const fT = ctex(256, 256, (c, w) => { c.fillStyle = '#b98a5a'; c.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ad7f50' : '#c1935f'; c.fillRect(0, i * 32, w, 30); c.fillStyle = '#8a6038'; c.fillRect(0, i * 32 + 30, w, 2); } });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, 12.2), tm(fT, W, 12.2, 2.5, { r: .8 })); fl.rotation.x = -Math.PI / 2; fl.position.set(CX, 0, 0); fl.receiveShadow = true; scene.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(W, 12.2), M({ color: 0xefede8, roughness: 1 })); ce.rotation.x = Math.PI / 2; ce.position.set(CX, 3.4, 0); scene.add(ce);
  [-3.5, 0, 3.5].forEach(z => [11.5, 15.1, 18.7].forEach(x => bx(1.8, .04, .2, basic(0xfff6e8), x, 3.3, z, { rs: false })));
  bx(W, 3.6, .2, tm(T.wall, W, 3.6, 2), CX, 1.8, -6.1);
  bx(.2, 3.6, 12.4, tm(T.wall, 12.4, 3.6, 2), 22.1, 1.8, 0);
  bx(W, 3.6, .2, tm(T.brick, W, 3.6, 1.6, { bump: 2, r: .95 }), CX, 1.8, 6.1);
  [11, 15, 19].forEach(x => { bx(1.7, 1.3, .06, metal, x, 1.9, 5.97); pln(1.6, 1.2, basic(0xbfe4fb), x, 1.9, 5.93, Math.PI); });
  { const im = new Image(); im.onload = () => {            // mural graffiti FVCK THE RULES (sama dengan toko)
      const t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true;
      const mw = 8, mh = mw * im.height / im.width, m = new THREE.Mesh(new THREE.PlaneGeometry(mw, mh), M({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.position.set(CX + 1.5, 2.15, -5.99); scene.add(m); }; im.src = 'mural.png'; }
  pln(3.2, .8, sign('AI OFFICE'), 21.98, 2.6, 0, -Math.PI / 2);
  /* pintu (dinding kanan toko) */
  [.9, 2.3].forEach(z => bx(.3, 2.5, .1, metal, 8.1, 1.25, z));
  pln(1.2, .3, sign('OFFICE'), 7.98, 2.85, 1.6, -Math.PI / 2); pln(1.2, .3, sign('STORE'), 8.22, 2.85, 1.6, Math.PI / 2);
  bx(.05, 2.4, 1.3, M({ color: 0x2a2a2e, roughness: .6 }), 8.45, 1.2, 3.0);
  [12.6, 17.6].forEach(x => { const l = new THREE.PointLight(0xfff1e0, 16, 13, 2); l.position.set(x, 3, 0); scene.add(l); lightsQ.push([l, 1]); });

  /* meja + agen */
  const woodM = tm(T.wood, 2.6, 1.3, 1.2, { r: .6 }), own = { p: scene };
  const desk = (x, z, w = 2.2) => { bx(w, .07, 1, woodM, x, .8, z, { cs: true }); [-1, 1].forEach(s => [-.4, .4].forEach(d => bx(.06, .76, .06, metal, x + s * (w / 2 - .1), .38, z + d)));
    bx(.5, .36, .04, black, x, 1.12, z - .2); bx(.05, .2, .05, black, x, .92, z - .2); bx(.45, .02, .16, black, x, .85, z + .15);
    const sc = bx(.44, .28, .01, basic(0x3a5a7a), x, 1.12, z - .17, own); STATIC.push([x - w / 2, z - .5, x + w / 2, z + .5]); return sc; };
  bx(3.4, .04, 2.4, M({ color: 0x232b3d, roughness: 1 }), 15.1, .03, -4.4, { rs: false });
  const mkLab = () => { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); s.scale.set(1.6, .4, 1);
    s.draw = (a, b, on) => { const g = c.getContext('2d'); g.clearRect(0, 0, 512, 128); g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#f2f2f2'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 122);
      g.fillStyle = on ? '#3ddc84' : '#777'; g.beginPath(); g.arc(34, 64, 13, 0, 7); g.fill(); g.fillStyle = '#f2f2f2'; g.textAlign = 'left'; g.font = '900 44px Impact, sans-serif'; g.fillText(a, 62, 58); g.fillStyle = '#bbb'; g.font = '26px monospace'; g.fillText(b || '', 62, 100); t.needsUpdate = true; };
    scene.add(s); return s; };
  const D = [['ORCHESTRATOR', 15.1, -4.2, 0x0a0a0a, ['Memecah instruksi', 'Memilih tool', 'Cek antrean approval']],
    ['COMMERCE', 11, -1.2, 0xd9482b, ['Cek order belum lunas', 'Rekap pembayaran', 'Cek resi']], ['LOGISTIK', 14.2, -1.2, 0xe3a008, ['Cek resi J&T', 'Hitung ongkir', 'Update pengiriman']],
    ['CREATIVE', 17.4, -1.2, 0x8e44ad, ['Tulis caption IG', 'Susun hashtag', 'Brief desain']], ['KONTEN IG', 20.6, -1.2, 0xe84393, ['Kalender konten', 'Jadwalkan draft', 'Riset tren']],
    ['DEVELOPER', 13.4, 2.4, 0x2f6bff, ['Review kode', 'Siapkan patch', 'Cek bug checkout']], ['QA', 16.4, 2.4, 0x16a085, ['Tes alur checkout', 'Tes login', 'Cek regresi']],
    ['SECURITY', 19.4, 2.4, 0x2c3e50, ['Cek aturan Firestore', 'Audit akses', 'Scan API key']]];
  const AGS = D.map(([role, x, z, col, tasks], i) => {
    const scr = desk(x, z, i ? 2.2 : 2.6), h = makeHuman({ top: col, pants: 0x1a1a1a, shoes: 0x111111 }); h.g.position.set(x, 0, z + .85); h.g.rotation.y = Math.PI; scene.add(h.g);
    const l = mkLab(); l.position.set(x, 2.45, z + .85); const a = { role, tasks, scr, h, l, w: false, task: '', i };
    SPOTS.push({ id: 'ag' + i, x, z: z + 1.9, lim: 1.3, t: `PRESS E · ${role} (AI)`, go: () => say(role + ' · AI', (a.w ? 'Sedang: ' + a.task : 'Standby.') + '\n\nStatus agen di kantor ini masih simulasi. Data nyata menyusul lewat window.fvckOffice.update().') });
    return a; });
  const setA = (a, w, task) => { a.w = w; a.task = task || a.tasks[Math.random() * a.tasks.length | 0]; a.scr.material.color.set(w ? 0x7fd0ff : 0x3a5a7a); a.l.draw(a.role, w ? a.task.slice(0, 22) : 'standby', w); };
  AGS.forEach((a, i) => setA(a, i < 3));
  window.fvckOffice = { update: (role, o) => { const a = AGS.find(q => q.role === role); if (a) setA(a, o.status === 'working', o.task); } };

  /* papan status di dinding */
  const bc = document.createElement('canvas'); bc.width = 512; bc.height = 160; const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace; let tok = 0;
  pln(2.6, .8, new THREE.MeshBasicMaterial({ map: bt, fog: false }), 10.8, 2.7, -5.97, 0);
  const drawB = () => { const g = bc.getContext('2d'), n = AGS.filter(a => a.w).length + (bs.wait <= 0 ? 1 : 0); g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 512, 160); g.strokeStyle = '#f2f2f2'; g.lineWidth = 6; g.strokeRect(4, 4, 504, 152);
    g.fillStyle = '#e8ff3a'; g.font = '900 40px Impact, sans-serif'; g.textAlign = 'left'; g.fillText('AGEN AKTIF ' + n + '/9', 24, 56); g.fillStyle = '#f2f2f2'; g.font = '26px monospace'; g.fillText('TOKEN ' + tok.toLocaleString('id-ID') + ' · RP 0', 24, 100); g.fillStyle = '#888'; g.font = '20px monospace'; g.fillText('DEMO · BUKAN DATA NYATA', 24, 138); bt.needsUpdate = true; };

  /* laporan dari data produk publik toko */
  const rep = () => { const P = S.products || [], A = S.acc || [], c = b => P.filter(p => p.badge === b).length, low = P.filter(p => p.badge === 'ready' && p.stock.length <= 1).map(p => p.name);
    return `Kaos: ${P.length} (ready ${c('ready')} · PO ${c('pre')} · arsip ${c('sold')}). Aksesoris: ${A.length}.\n` + (low.length ? 'Ukuran hampir habis: ' + low.slice(0, 5).join(', ') + '.' : 'Tidak ada ready stock yang ukurannya tinggal 1.'); };
  async function orderRep() {
    if (!AI_WORKER) return say('LAPORAN ORDER', 'Laporan order butuh Worker AI + login admin. Isi AI_WORKER di office.js (lihat README).');
    const u = S.user; if (!u || !u.getIdToken) return say('LAPORAN ORDER', 'Login admin dulu lewat langkah checkout di kasir.');
    say('LAPORAN ORDER', 'Menghitung...');
    try { const r = await fetch(AI_WORKER + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await u.getIdToken() }, body: JSON.stringify({ readonly: true, messages: [{ role: 'user', text: 'Ringkas order: jumlah per status dan yang belum lunas. Singkat.' }] }) });
      const j = await r.json(); say('LAPORAN ORDER', j.reply || 'Error: ' + j.error); } catch (e) { say('LAPORAN ORDER', 'Gagal: ' + e.message); } }
  /* KASIR-AI */
  desk(10.2, 4.6, 2.2); pln(1.4, .35, sign('LAPORAN'), 10.2, 1.3, 4.08, Math.PI);
  const kc = makeHuman({ top: 0x0a0a0a, pants: 0x1a1a1a, shoes: 0x111111, cap: 0x0a0a0a }); kc.g.position.set(10.2, 0, 5.4); kc.g.rotation.y = Math.PI; scene.add(kc.g);
  const kl = mkLab(); kl.position.set(10.2, 2.45, 5.4); kl.draw('KASIR-AI', 'laporan harian', true);
  SPOTS.push({ id: 'laporan', x: 10.2, z: 3.3, lim: 1.5, t: 'PRESS E · KASIR-AI · LAPORAN', go: () => say('KASIR-AI · LAPORAN', rep(), [['LAPORAN ORDER', orderRep], ['TUTUP']]) });

  /* STOK-BOT: patroli di toko, cek hanger satu per satu */
  const bot = makeHuman({ top: 0x2f6bff, pants: 0x1a1a1a, shoes: 0xe8ff3a, cap: 0x2f6bff }); bot.g.position.set(-2.6, 0, 3.8); scene.add(bot.g);
  const bl = mkLab(); scene.add(bl); bl.draw('STOK-BOT', 'mulai patroli', true);
  var bs = { tgt: null, wait: 1, cur: null, walk: 0, mv: false, tm: 0 };
  const botSpot = { id: 'stokbot', x: -2.6, z: 3.8, lim: 1.7, t: 'PRESS E · STOK-BOT (AI)', go: () => { const q = bs.cur && bs.cur.p;
    say('STOK-BOT · AI', (q ? `Terakhir cek: ${q.name}\nStatus: ${({ ready: 'READY STOCK', pre: 'PRE ORDER', sold: 'ARSIP' })[q.badge] || q.badge}\nUkuran tersedia: ${q.stock.join(' / ') || '-'}\n\n` : '') + rep(), [['BUKA PRODUK', () => q && X.openProduct(q.id, () => X.closePanel())], ['TUTUP']]); } };
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

  setInterval(() => { const a = AGS[Math.random() * AGS.length | 0]; setA(a, !a.w); tok += AGS.filter(q => q.w).length * (40 + Math.random() * 60 | 0); drawB(); }, 1800); drawB();
  return {
    solids: [], update(t, dt) { AGS.forEach(a => { const w = a.w ? 1 : 0; a.h.aL.rotation.x = w ? -.8 + Math.sin(t * 10 + a.i) * .12 : 0; a.h.aR.rotation.x = w ? -.8 + Math.cos(t * 9 + a.i) * .12 : 0; }); kc.aL.rotation.x = Math.sin(t * 1.4) * .05; botTick(dt); },
    inside: (x, y, z) => y > .3 && y < 3.2 && ((x > 8.3 && x < 21.9 && z > -5.9 && z < 5.9) || (x > 7.75 && x <= 8.3 && z > 1 && z < 2.2)),
    clamp(p, RW, RZN, RZP) {
      const inDoor = p.z > 1 && p.z < 2.2; p.x = Math.max(-RW + .1, Math.min(21.4, p.x));
      if (!inDoor) p.x = this.side ? Math.max(p.x, 8.3) : Math.min(p.x, RW - .1);
      if (p.x > 7.95) this.side = true; else if (p.x < 7.5) this.side = false;
      p.z = Math.max(RZN + .1, Math.min(RZP, p.z)); if (p.x > RW - .1 && p.x < 8.3) p.z = Math.max(1, Math.min(2.2, p.z)); }, side: false };
}
