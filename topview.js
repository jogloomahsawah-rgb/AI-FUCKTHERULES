// Tampilan ATAS: peta kantor gaya kardus (kotak-kotak), tanpa karakter pemain dan tanpa joystick.
// Hanya geser (putar), cubit / scroll (zoom). Status agen dibaca dari office.js lewat getState().
export function initTopView({ THREE, getState }) {
  const wrap = document.createElement('div'); wrap.id = 'tv'; wrap.hidden = true;
  wrap.innerHTML = '<canvas></canvas><div class="tv-cards"></div><div class="tv-labels"></div><div class="tv-hint">Geser untuk memutar · cubit atau scroll untuk zoom · data masih simulasi</div>';
  document.body.appendChild(wrap);
  const cv = wrap.querySelector('canvas'), cards = wrap.querySelector('.tv-cards'), labs = wrap.querySelector('.tv-labels');
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setClearColor(0x0b1226);
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1, .1, 200);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 1.55)); const dl = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(-6, 12, 8); sc.add(dl);
  const mat = {}, mt = c => mat[c] || (mat[c] = new THREE.MeshLambertMaterial({ color: c }));
  const box = (w, h, d, c, x, y, z, p = sc) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt(c)); m.position.set(x, y, z); p.add(m); return m; };

  /* lantai kayu, karpet, dinding, jendela, perabot */
  const ft = document.createElement('canvas'); ft.width = ft.height = 128; { const g = ft.getContext('2d'); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#e9a95f' : '#f0b469'; g.fillRect(0, i * 16, 128, 14); g.fillStyle = '#c98a45'; g.fillRect(0, i * 16 + 14, 128, 2); } }
  const ftx = new THREE.CanvasTexture(ft); ftx.wrapS = ftx.wrapT = THREE.RepeatWrapping; ftx.repeat.set(8, 6); ftx.colorSpace = THREE.SRGBColorSpace;
  const fl = new THREE.Mesh(new THREE.BoxGeometry(16, .2, 12), new THREE.MeshLambertMaterial({ map: ftx })); fl.position.y = -.1; sc.add(fl);
  box(11.6, .03, 8.6, 0x8ec5ff, 0, .02, .5); box(11, .05, 8, 0x6f84b3, 0, .04, .5);
  box(16, 3.2, .25, 0xf3f2ee, 0, 1.6, -6.1); box(.25, 3.2, 12, 0xf3f2ee, -8.1, 1.6, 0);
  [-4.5, 0, 4.5].forEach(x => { box(1.5, 1.7, .1, 0xe6c58d, x, 1.9, -5.95); box(1.25, 1.45, .12, 0xbfe0f7, x, 1.9, -5.93); });
  [-3, 3].forEach(z => { box(.1, 1.7, 1.5, 0xe6c58d, -7.95, 1.9, z); box(.12, 1.45, 1.25, 0xbfe0f7, -7.93, 1.9, z); });
  box(1.2, 2.2, .9, 0xf0d9a6, 6.9, 1.1, -5.4); box(1.2, 1.4, .9, 0xf0d9a6, 7.2, .7, -4.2); box(.3, .3, .3, 0xfff0b3, 6.9, 2.4, -5.4);
  box(.7, .5, .7, 0xb97a4a, -7, .25, 5); box(.55, .7, .55, 0x7fd49a, -7, .85, 5);

  /* meja + agen (kotak) */
  const skin = 0xf2c9a0, hair = [0x3b2a1e, 0x1a1a2e, 0x8a5a3b, 0x222222, 0x5a3825];
  const D = [['ORCHESTRATOR', 0x2b2f3a, -3.6, -2.6], ['COMMERCE', 0xe8643f, 0, -2.6], ['LOGISTIK', 0xf0b72a, 3.6, -2.6],
    ['CREATIVE', 0xa05fc4, -3.6, .2], ['KONTEN IG', 0xf06fb0, 0, .2], ['STOK', 0x3f7bff, 3.6, .2],
    ['DEVELOPER', 0x5b9cff, -3.6, 3], ['QA', 0x2bb89a, 0, 3], ['SECURITY', 0x5a7088, 3.6, 3]];
  const AG = D.map(([role, col, x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); sc.add(g);
    box(2.4, .08, 1.1, 0xfbf0c9, 0, .78, 0, g); [[-1.1, -.45], [1.1, -.45], [-1.1, .45], [1.1, .45]].forEach(([a, b]) => box(.08, .74, .08, 0xcdbf8f, a, .37, b, g));
    box(.9, .05, .4, 0xe4d6a4, -.5, .86, .05, g);
    box(.12, .3, .12, 0x24304a, 0, .97, -.3, g); const scr = box(.85, .5, .06, 0x24304a, 0, 1.3, -.3, g); const face = box(.74, .39, .02, 0x3a5a7a, 0, 1.3, -.26, g);
    box(.55, .08, .3, 0xf5f5f5, .35, .83, .1, g);
    box(.7, .08, .7, 0x1d3a8a, 0, .5, 1.25, g); box(.7, .75, .08, 0x1d3a8a, 0, .9, 1.62, g); box(.08, .45, .08, 0x333333, 0, .25, 1.25, g);
    const a = new THREE.Group(); a.position.set(0, 0, 1.0); g.add(a);
    box(.32, .16, .6, 0x1f2a44, 0, .55, -.2, a); box(.3, .5, .3, 0x1f2a44, -.12, .27, -.5, a).position.x = -.12; box(.3, .5, .3, 0x1f2a44, .12, .27, -.5, a).position.x = .12;
    box(.55, .75, .32, col, 0, 1.05, 0, a); box(.4, .4, .4, skin, 0, 1.63, -.02, a); box(.44, .16, .44, hair[i % hair.length], 0, 1.88, .02, a);
    const mkArm = s => { const p = new THREE.Group(); p.position.set(.36 * s, 1.3, 0); a.add(p); box(.14, .5, .14, col, 0, -.22, 0, p); box(.12, .12, .12, skin, 0, -.52, 0, p); return p; };
    const aL = mkArm(-1), aR = mkArm(1);
    return { role, x, z, face, aL, aR, w: false, task: '', i };
  });
  box(.55, .55, .55, 0xc8f0d4, -6.6, .28, 4.1); box(.5, .3, .5, 0xe5b88a, -6.6, .7, 4.1);          // kardus dekor

  /* label HTML (pil nama + gelembung tugas), kartu statistik */
  const pills = AG.map(a => { const p = document.createElement('div'); p.className = 'tv-pill'; const b = document.createElement('div'); b.className = 'tv-bub'; labs.append(b, p); return { p, b }; });
  const fmt = n => Number(n || 0).toLocaleString('id-ID');
  let stT = 0, last = { n: 0, tok: 0 };
  function pull() {
    const s = getState && getState(); if (!s) return; let n = 0;
    s.agents.forEach(q => { const a = AG.find(z => z.role === q.role); if (!a) return; a.w = !!q.w; a.task = q.task || ''; a.face.material = mt(a.w ? 0x8fd6ff : 0x3a5a7a); if (a.w) n++; });
    last = { n, tok: s.tok };
    cards.innerHTML = [['Agen aktif', n + '/9'], ['Token', fmt(s.tok)], ['Biaya hari ini', 'Rp 0'], ['Anggaran', 'Gratis']].map(([k, v]) => `<div class="tv-card"><small>${k}</small><b>${v}</b></div>`).join('');
    AG.forEach((a, i) => { pills[i].p.innerHTML = `<i style="background:${a.w ? '#3ddc84' : '#777'}"></i>${a.role}`; pills[i].b.textContent = a.w ? a.task : ''; pills[i].b.style.display = a.w ? '' : 'none'; });
  }

  /* kamera orbit: geser = putar, cubit/scroll = zoom */
  const O = { th: .75, ph: .95, rad: 17, tx: 0, ty: .6, tz: .6 }, ptr = new Map(); let pd = 0;
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]); pd = 0; });
  cv.addEventListener('pointerup', e => ptr.delete(e.pointerId)); cv.addEventListener('pointercancel', e => ptr.delete(e.pointerId));
  cv.addEventListener('pointermove', e => {
    const o = ptr.get(e.pointerId); if (!o) return; const n = [e.clientX, e.clientY];
    if (ptr.size === 1) { O.th -= (n[0] - o[0]) * .007; O.ph = Math.max(.35, Math.min(1.35, O.ph - (n[1] - o[1]) * .005)); ptr.set(e.pointerId, n); }
    else { const other = [...ptr.entries()].find(([k]) => k !== e.pointerId)[1], d = Math.hypot(n[0] - other[0], n[1] - other[1]); if (pd) O.rad = Math.max(8, Math.min(34, O.rad * pd / d)); pd = d; ptr.set(e.pointerId, n); }
  });
  cv.addEventListener('wheel', e => { e.preventDefault(); O.rad = Math.max(8, Math.min(34, O.rad * (1 + e.deltaY * .001))); }, { passive: false });

  let W = 0, H = 0, t = 0; const v3 = new THREE.Vector3();
  return {
    isOn: () => !wrap.hidden,
    setActive(on) { if (on === !wrap.hidden) return; wrap.hidden = !on; if (on) { stT = 0; W = 0; } },
    frame(dt) {
      if (wrap.hidden) return; t += dt; stT -= dt; if (stT <= 0) { stT = .6; pull(); }
      const w = wrap.clientWidth, h = wrap.clientHeight; if (w !== W || h !== H) { W = w; H = h; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
      const k = cam.aspect < 1 ? 1.45 : 1, R = O.rad * k, sp = Math.sin(O.ph), cp = Math.cos(O.ph);
      cam.position.set(O.tx + Math.sin(O.th) * sp * R, O.ty + cp * R, O.tz + Math.cos(O.th) * sp * R); cam.lookAt(O.tx, O.ty, O.tz);
      AG.forEach((a, i) => { const x = a.w ? -1.15 + Math.sin(t * 9 + a.i) * .12 : 0; a.aL.rotation.x = x; a.aR.rotation.x = a.w ? -1.15 + Math.cos(t * 8 + a.i) * .12 : 0;
        v3.set(a.x, 2.35, a.z + 1).project(cam); const vis = v3.z < 1, px = (v3.x * .5 + .5) * w, py = (-v3.y * .5 + .5) * h, P = pills[i];
        P.p.style.display = vis ? '' : 'none'; P.p.style.left = px + 'px'; P.p.style.top = py + 'px'; P.b.style.left = px + 'px'; P.b.style.top = (py - 24) + 'px'; if (!vis) P.b.style.display = 'none'; else P.b.style.display = a.w ? '' : 'none'; });
      r.render(sc, cam);
    }
  };
}
