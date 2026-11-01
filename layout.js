/* LAYOUT KANTOR (dipakai office.js 3D dan topview.js denah atas, supaya posisi selalu sama).
   KOMPLEKS = pulau di sisi kanan toko, pintu masuk di (8.1, 1.6). Ruangan TIDAK lagi berimpitan: tiap divisi punya paviliun sendiri
   dengan jarak >= 3.6 m, lalu ada PLAZA terbuka di tengah, kolam renang, bar, dan lounge. Jalan antar tempat lewat graf NODES/EDGES di bawah.
   Baris utara : MANAGER | OPERASIONAL | MARKETING   Baris selatan: DEVELOPMENT | RAPAT | KEUANGAN   Timur: LOUNGE (utara), KOLAM (tengah), BAR (selatan).
   Isi tiap ruangan dipindah utuh dari denah lama (meja, jalur keluar) memakai MOVE, jadi susunan di dalam ruangan tetap sama. */
export const OFFICE_X2 = 48;     // sisi timur pulau
export const OX1 = 8.2, OZ1 = -16, OZ2 = 17.6;   // batas barat (dinding toko), utara, selatan
export const CORR_Z = 1.6;
const R2 = v => Math.round(v * 100) / 100;

/* ---- ruangan: koordinat lama + perpindahan (dx, dz) tiap ruangan ---- */
const MOVE = { MANAGER: [2.8, -8.5], OPERASIONAL: [6.4, -8.5], MARKETING: [10, -8.5], DEVELOPMENT: [2.8, 7.7], RAPAT: [6.6, 7.7], KEUANGAN: [10.2, 7.7] };
const ROOMS_O = [
  { name: 'MANAGER',     x1: 8.2,  x2: 14.6, z1: -6.1, z2: .5,  rug: 0x2a2f3a, lab: [11.4, -5.2] },
  { name: 'OPERASIONAL', x1: 14.6, x2: 21.0, z1: -6.1, z2: .5,  rug: 0xb5502f, lab: [17.8, -5.2] },
  { name: 'MARKETING',   x1: 21.0, x2: 27.6, z1: -6.1, z2: .5,  rug: 0x9b3d78, lab: [24.3, -5.2] },
  { name: 'DEVELOPMENT', x1: 8.2,  x2: 18.4, z1: 2.7,  z2: 6.1, rug: 0x24508f, lab: [16.9, 3.25] },
  { name: 'RAPAT',       x1: 18.4, x2: 22.8, z1: 2.7,  z2: 6.1, rug: 0x4a5a48, lab: [20.6, 3.25] },
  { name: 'KEUANGAN',    x1: 22.8, x2: 27.6, z1: 2.7,  z2: 6.1, rug: 0x1f7a4d, lab: [25.2, 3.25] },
];
const DOORS_O = [
  { name: 'MANAGER', x: 12.9, z: .5, w: 1.4, side: 1 }, { name: 'OPERASIONAL', x: 17.9, z: .5, w: 1.4, side: 1 }, { name: 'MARKETING', x: 24.3, z: .5, w: 1.4, side: 1 },
  { name: 'DEVELOPMENT', x: 11.4, z: 2.7, w: 1.4, side: -1 }, { name: 'RAPAT', x: 19.4, z: 2.7, w: 1.6, side: -1 }, { name: 'KEUANGAN', x: 26.0, z: 2.7, w: 1.4, side: -1 },
];
const AGENTS_O = [
  { role: 'MANAGER',   room: 'MANAGER',     x: 10.6, z: -4.2, w: 2.6, exit: [[12.4, -3.35], [12.9, -3.35], [12.9, 0], [12.9, 1.6]] },
  { role: 'COMMERCE',  room: 'OPERASIONAL', x: 16.4, z: -3.9, w: 2.0, exit: [[17.65, -3.05], [17.9, -3.05], [17.9, 0], [17.9, 1.6]] },
  { role: 'LOGISTIK',  room: 'OPERASIONAL', x: 19.4, z: -3.9, w: 2.0, exit: [[18.15, -3.05], [17.9, -3.05], [17.9, 0], [17.9, 1.6]] },
  { role: 'CREATIVE',  room: 'MARKETING',   x: 22.7, z: -3.9, w: 2.0, exit: [[23.95, -3.05], [24.3, -3.05], [24.3, 0], [24.3, 1.6]] },
  { role: 'KONTEN IG', room: 'MARKETING',   x: 25.9, z: -3.9, w: 2.0, exit: [[24.65, -3.05], [24.3, -3.05], [24.3, 0], [24.3, 1.6]] },
  { role: 'PEMASARAN', room: 'MARKETING',   x: 22.7, z: -1.45, w: 2.0, exit: [[23.95, -.6], [24.3, -.6], [24.3, 0], [24.3, 1.6]] },
  { role: 'DEVELOPER', room: 'DEVELOPMENT', x: 9.6,  z: 4.35, w: 2.2, exit: [[10.95, 5.2], [11.4, 5.2], [11.4, 3.3], [11.4, 1.6]] },
  { role: 'QA',        room: 'DEVELOPMENT', x: 13.2, z: 4.35, w: 2.2, exit: [[11.85, 5.2], [11.4, 5.2], [11.4, 3.3], [11.4, 1.6]] },
  { role: 'SECURITY',  room: 'DEVELOPMENT', x: 16.4, z: 4.35, w: 2.2, exit: [[14.8, 5.2], [14.8, 3.3], [11.4, 3.3], [11.4, 1.6]] },
  { role: 'KEUANGAN',  room: 'KEUANGAN',    x: 24.2, z: 4.35, w: 2.0, exit: [[25.6, 5.2], [26.0, 5.2], [26.0, 3.3], [26.0, 1.6]] },
];
export const ROOMS = ROOMS_O.map(r => { const [dx, dz] = MOVE[r.name]; return { ...r, x1: R2(r.x1 + dx), x2: R2(r.x2 + dx), z1: R2(r.z1 + dz), z2: R2(r.z2 + dz), lab: [R2(r.lab[0] + dx), R2(r.lab[1] + dz)] }; });
const RM = Object.fromEntries(ROOMS.map(r => [r.name, r]));
export const DOORS = DOORS_O.map(d => { const [dx, dz] = MOVE[d.name]; return { ...d, x: R2(d.x + dx), z: R2(d.z + dz) }; });
export const AGENTS = AGENTS_O.map(a => { const [dx, dz] = MOVE[a.room], exit = a.exit.map(([x, z]) => [R2(x + dx), R2(z + dz)]); return { ...a, x: R2(a.x + dx), z: R2(a.z + dz), exit, seat: [R2(a.x + dx), R2(a.z + dz + .85)], vis: exit[0] }; });

/* dinding paviliun: keliling tiap ruangan, celah di pintu (bawah padat, atas kaca, digambar office.js) */
export const WALLS = ROOMS.flatMap(r => { const d = DOORS.find(q => q.name === r.name), zd = d.side > 0 ? r.z2 : r.z1, zo = d.side > 0 ? r.z1 : r.z2, g1 = d.x - d.w / 2, g2 = d.x + d.w / 2;
  return [[r.x1, zd, g1, zd], [g2, zd, r.x2, zd], [r.x1, zo, r.x2, zo], [r.x1, r.z1, r.x1, r.z2], [r.x2, r.z1, r.x2, r.z2]].map(w => w.map(R2)); });

/* ---- graf jalan: jalan antar ruangan lewat plaza / jalan utara / jalan selatan. Semua ujung exit[] harus jatuh tepat di salah satu node. ---- */
export const NODES = { ENT: [9.6, 1.6], AV: [13, 1.6], PW: [17.5, 1.6], PN: [25, -2.4], PS: [25, 5.6], PE: [32.5, 1.6],
  NM: [15.7, -6.9], NO: [24.3, -6.9], NK: [34.3, -6.9], SD: [14.2, 9.3], SR: [26, 9.3], SF: [36.2, 9.3],
  PO: [39.2, 1.6], LG: [39.2, -6.9], BRW: [39.4, 9.3], BR: [43.6, 9.8] };
const EDGES = [['ENT', 'AV'], ['AV', 'PW'], ['PW', 'PN'], ['PW', 'PS'], ['PN', 'PE'], ['PS', 'PE'], ['PW', 'NM'], ['NM', 'NO'], ['NO', 'NK'], ['PN', 'NO'], ['PE', 'NK'], ['AV', 'SD'], ['SD', 'SR'], ['SR', 'SF'], ['PS', 'SR'], ['PE', 'SF'],
  ['PE', 'PO'], ['NK', 'LG'], ['SF', 'BRW'], ['BRW', 'BR'], ['PO', 'BRW']];
const nodeOf = p => Object.keys(NODES).find(k => Math.hypot(NODES[k][0] - p[0], NODES[k][1] - p[1]) < .05);
function route(a, b) {   // Dijkstra kecil di graf jalan: daftar titik dari a ke b (termasuk keduanya)
  const A = nodeOf(a), B = nodeOf(b); if (!A || !B) return [a, b]; if (A === B) return [a];
  const dist = { [A]: 0 }, prev = {}, todo = new Set(Object.keys(NODES)), nb = k => EDGES.filter(e => e.includes(k)).map(e => e[0] === k ? e[1] : e[0]);
  while (todo.size) { let u = null; todo.forEach(k => { if (dist[k] !== undefined && (u === null || dist[k] < dist[u])) u = k; }); if (u === null || u === B) break; todo.delete(u);
    nb(u).forEach(v => { const d = dist[u] + Math.hypot(NODES[u][0] - NODES[v][0], NODES[u][1] - NODES[v][1]); if (dist[v] === undefined || d < dist[v]) { dist[v] = d; prev[v] = u; } }); }
  const out = []; for (let k = B; k; k = prev[k]) out.unshift(NODES[k]); return out[0] && nodeOf(out[0]) === A ? out : [a, b]; }

/* sambung dua jalur keluar (seat -> jalan) jadi satu jalur A -> B. Satu ruangan: potong di titik yang sama. Beda ruangan: lewat graf jalan. */
export function joinPath(ex1, ex2) {
  for (let i = 0; i < ex1.length; i++) { const j = ex2.findIndex(p => p[0] === ex1[i][0] && p[1] === ex1[i][1]); if (j >= 0) return ex1.slice(0, i + 1).concat(ex2.slice(0, j).reverse()); }
  const a = ex1[ex1.length - 1], b = ex2[ex2.length - 1];
  return ex1.concat(route(a, b).slice(1)).concat(ex2.slice(0, -1).reverse());
}

/* ---- lantai berwarna (jalan, plaza, area) ---- */
export const FLOORS = [
  [8.2, .8, 17.0, 2.4, 0xd3ccbe], [34.5, .8, 38.8, 2.4, 0xd3ccbe], [15.5, -5, 34.5, 8.2, 0xd9d3c6], [14.2, -7.5, 40.2, -6.3, 0xd3ccbe], [12.8, 8.7, 40.6, 9.9, 0xd3ccbe],
  [38.6, -6.4, 47.7, 6.6, 0xe9e4d8], [39.6, 9.6, 47.7, 16.9, 0x7a5230], [39.8, -14.9, 47.7, -8.4, 0xcdbfa6],
];
/* zona terbuka (label di denah atas dan papan nama di 3D) */
export const ZONES = [{ name: 'PLAZA', lab: [25, 4.2] }, { name: 'KOLAM', lab: [43.7, -6.9] }, { name: 'BAR', lab: [43.6, 10.6] }, { name: 'LOUNGE', lab: [43.7, -14.1] }];

/* ---- dekorasi: [w, h, d, warna, x, y(tengah), z, jenis]. jenis 'w' = air, 'g' = menyala (tanpa bayangan). SOLIDS = kotak tabrakan [x1,z1,x2,z2] ---- */
export const DECOR = [], SOLIDS = [];
const add = (w, h, d, c, x, y, z, k) => DECOR.push([w, h, d, c, x, y, z, k]), sol = (x1, z1, x2, z2) => SOLIDS.push([x1, z1, x2, z2]);
const tree = (x, z, s = 1) => { add(.35 * s, 1.5 * s, .35 * s, 0x8a5a3b, x, .75 * s, z); add(1.7 * s, 1.3 * s, 1.7 * s, 0x3f9e55, x, 2.1 * s, z); add(1.1 * s, .8 * s, 1.1 * s, 0x4fb868, x, 3.05 * s, z); sol(x - .45, z - .45, x + .45, z + .45); };
const bench = (x, z, face) => { const s = face > 0 ? -1 : 1; add(2, .12, .5, 0x8a5a3b, x, .42, z); add(2, .5, .1, 0x8a5a3b, x, .78, z + s * .28); [-.85, .85].forEach(a => add(.1, .4, .4, 0x6b4428, x + a, .2, z)); sol(x - 1, z - .4, x + 1, z + .4); };
/* PLAZA: pohon besar di tengah (jalan memutar), bangku, pohon sudut */
add(2.6, .45, 2.6, 0xcfc7b8, 25, .22, 1.6); add(2.2, .08, 2.2, 0x6b4a2b, 25, .49, 1.6); add(.35, 2, .35, 0x8a5a3b, 25, 1.5, 1.6); add(2, 1.5, 2, 0x3f9e55, 25, 2.95, 1.6); add(1.3, 1, 1.3, 0x4fb868, 25, 4, 1.6); sol(23.7, .3, 26.3, 2.9);
bench(21, -3.9, 1); bench(29, -3.9, 1); bench(21, 7.4, -1); bench(29, 7.4, -1);
[[17.8, -4.2], [32.4, -4.2], [17.8, 7.8], [32.4, 7.8], [12.6, 6.6], [12.6, -3.6]].forEach(([x, z]) => tree(x, z, .9));
/* KOLAM RENANG: tepi putih + air (x 41..46.4, z -5..2.5), tangga, 4 sunbed + 2 payung */
add(6.2, .3, .4, 0xf1ece0, 43.7, .15, -5.2); add(6.2, .3, .4, 0xf1ece0, 43.7, .15, 2.7); add(.4, .3, 8, 0xf1ece0, 40.8, .15, -1.25); add(.4, .3, 8, 0xf1ece0, 46.6, .15, -1.25);
add(5.4, .06, 7.5, 0x35b6ea, 43.7, .26, -1.25, 'w'); [.9, 1.4].forEach(z => add(.05, 1, .05, 0xbfc5cc, 41.15, .8, z)); add(.05, .05, .6, 0xbfc5cc, 41.15, 1.28, 1.15); sol(40.6, -5.4, 46.8, 2.9);
[41.7, 43.1, 44.9, 46.3].forEach(x => { add(.7, .2, 1.9, 0xf2efe6, x, .35, 4.9); add(.7, .5, .1, 0xf2efe6, x, .62, 5.8); add(.64, .06, 1.8, 0xffffff, x, .47, 4.9); [-.3, .3].forEach(a => add(.06, .25, .06, 0x333333, x + a, .13, 4.3)); sol(x - .4, 3.9, x + .4, 5.9); });
[[42.4, 0xf2f2f2], [45.6, 0x111111]].forEach(([x, c]) => { add(.08, 2.5, .08, 0x555555, x, 1.25, 5.5); add(2.5, .1, 2.5, c, x, 2.5, 5.2); add(2.5, .06, .3, 0xe8ff3a, x, 2.4, 6.4); });
[40.7, 47.3].forEach(x => tree(x, 6.2, .7));
/* BAR: konter, rak botol, atap rumbia, 5 bangku */
add(6.4, 1.05, .9, 0x2b2118, 43.6, .52, 13.4); add(6.6, .08, 1.1, 0xe3c28f, 43.6, 1.09, 13.4); add(6.8, 2.5, .3, 0x2a2f3a, 43.6, 1.25, 15.9);
[1.4, 1.9].forEach(y => add(6, .06, .35, 0x8a5a3b, 43.6, y, 15.65)); for (let i = 0; i < 13; i++) { const x = 40.9 + i * .45; add(.1, .3, .1, [0x3f9e55, 0xe8643f, 0xe8ff3a, 0xbfe4fb][i % 4], x, 1.58, 15.65); if (i % 2) add(.1, .3, .1, [0xe8ff3a, 0x3f9e55, 0xe8643f][i % 3], x, 2.08, 15.65); }
[[40.2, 10.2], [47, 10.2], [40.2, 16.4], [47, 16.4]].forEach(([x, z]) => add(.12, 3, .12, 0x5a3a1e, x, 1.5, z)); add(7.2, .16, 6.6, 0xb89a5a, 43.6, 3.1, 13.3); add(7.4, .06, 6.8, 0x8f7440, 43.6, 3.22, 13.3);
[41.2, 42.4, 43.6, 44.8, 46].forEach(x => { add(.4, .08, .4, 0xd9482b, x, .68, 12.3); add(.08, .6, .08, 0x333333, x, .34, 12.3); }); sol(40.3, 12.85, 46.9, 14); sol(40.2, 15.6, 47, 16.2);
/* LOUNGE: sofa menghadap selatan (ke pintu masuk), meja kopi, meja biliar, 3 bean bag, papan poster */
add(3.4, .45, 1, 0x2a2f3a, 41.8, .22, -13.4); add(3.4, .55, .3, 0x2a2f3a, 41.8, .72, -13.95); [-1.6, 1.6].forEach(a => add(.3, .6, 1, 0x2a2f3a, 41.8 + a, .3, -13.4)); add(2.6, .12, .8, 0xe9e9e6, 41.8, .5, -13.3); sol(40, -14.2, 43.6, -12.8);
add(1.6, .4, .8, 0x5a3a1e, 41.8, .2, -11.6); sol(41, -12, 42.6, -11.2); add(4.4, .03, 3.2, 0x2a2f3a, 41.8, .03, -12.3);
add(2.5, .75, 1.3, 0x5a3a1e, 45.4, .38, -13.2); add(2.2, .05, 1, 0x1f7a4d, 45.4, .78, -13.2); sol(44.1, -13.9, 46.7, -12.5);
[[46.9, -9.4, 0xe8643f], [46.9, -11.0, 0x2b6cff], [42.9, -9.4, 0xe8ff3a]].forEach(([x, z, c]) => { add(.9, .6, .9, c, x, .3, z); sol(x - .5, z - .5, x + .5, z + .5); });
add(3.4, 1.6, .06, 0x0a0a0a, 45.4, 1.7, -15.9); add(3.1, 1.3, .02, 0x1b2a44, 45.4, 1.7, -15.84, 'g');
tree(39.4, -14.4, .8); tree(47.1, -14.4, .7);
/* sudut taman: pohon di dekat pintu masuk dan tepi pulau */
[[10.4, 4.2], [10.4, -2.6], [37.5, 15.6], [9.6, 15.4], [9.6, -14.6], [20.4, -15.0]].forEach(([x, z]) => tree(x, z, .8));

/* ---- tempat santai (dipakai denah atas): ry 0 = hadap utara (-z), PI = selatan, PI/2 = barat, -PI/2 = timur. wp = titik belok agar tidak menembus benda ---- */
export const LEISURE = [
  ...[41.7, 43.1, 44.9, 46.3].map(x => ({ x, z: 4.9, ry: 0, pose: 'sit', via: 'POOL', say: 'berjemur di sunbed', wp: [[39.6, 3.4], [x, 3.4]] })),
  { x: 39.9, z: -3, ry: -Math.PI / 2, pose: 'stand', via: 'POOL', say: 'lihat kolam', wp: [[39.9, 1.6]] }, { x: 39.9, z: -.6, ry: -Math.PI / 2, pose: 'stand', via: 'POOL', say: 'ngopi di tepi kolam', cup: 1, wp: [[39.9, 1.6]] },
  ...[41.2, 42.4, 43.6, 44.8, 46].map(x => ({ x, z: 12.3, ry: Math.PI, pose: 'sit', via: 'BAR', say: 'nongkrong di bar', cup: 1 })),
  { x: 41.0, z: -13.3, ry: Math.PI, pose: 'sit', via: 'LOUNGE', say: 'rebahan di sofa', wp: [[39.9, -10.6], [39.9, -12.0]] }, { x: 42.6, z: -13.3, ry: Math.PI, pose: 'sit', via: 'LOUNGE', say: 'ngobrol di sofa', wp: [[39.9, -10.6], [39.9, -12.0]] },
  { x: 45.4, z: -11.6, ry: 0, pose: 'stand', via: 'LOUNGE', say: 'main biliar', wp: [[43.6, -8.2], [45.4, -8.2]] }, { x: 43.9, z: -11.8, ry: -Math.PI / 2, pose: 'stand', via: 'LOUNGE', say: 'lihat orang main biliar', wp: [[43.9, -8.2]] },
  { x: 21, z: -3.7, ry: Math.PI, pose: 'sit', via: 'PLAZAN', say: 'duduk di plaza' }, { x: 29, z: -3.7, ry: Math.PI, pose: 'sit', via: 'PLAZAN', say: 'cari udara segar' },
  { x: 21, z: 7.1, ry: 0, pose: 'sit', via: 'PLAZAS', say: 'duduk di plaza', cup: 1 }, { x: 29, z: 7.1, ry: 0, pose: 'sit', via: 'PLAZAS', say: 'ngopi di plaza', cup: 1 },
];
export const BREAK_EXIT = { POOL: [NODES.PO], BAR: [NODES.BR], LOUNGE: [NODES.LG], PLAZAN: [NODES.PN], PLAZAS: [NODES.PS] };
export const BREAK_NAME = { POOL: 'kolam', BAR: 'bar', LOUNGE: 'lounge', PLAZAN: 'plaza', PLAZAS: 'plaza' };

/* siapa melapor ke siapa (saling samper): [dari, ke, teks] */
export const LINKS = [
  ['COMMERCE', 'MANAGER', 'lapor order'], ['LOGISTIK', 'COMMERCE', 'kabar resi'], ['CREATIVE', 'KONTEN IG', 'brief caption'],
  ['KONTEN IG', 'COMMERCE', 'jadwal promo'], ['DEVELOPER', 'QA', 'minta tes'], ['QA', 'SECURITY', 'hasil tes'],
  ['SECURITY', 'MANAGER', 'lapor keamanan'], ['DEVELOPER', 'MANAGER', 'status patch'], ['CREATIVE', 'MANAGER', 'lapor konten'],
  ['MANAGER', 'DEVELOPER', 'cek progres'], ['MANAGER', 'LOGISTIK', 'cek pengiriman'], ['LOGISTIK', 'MANAGER', 'lapor kirim'],
  ['PEMASARAN', 'KONTEN IG', 'arahan konten'], ['PEMASARAN', 'CREATIVE', 'brief kampanye'], ['PEMASARAN', 'MANAGER', 'lapor strategi'], ['KONTEN IG', 'PEMASARAN', 'data performa'],
  ['KEUANGAN', 'MANAGER', 'lapor kas'], ['COMMERCE', 'KEUANGAN', 'order lunas'], ['LOGISTIK', 'KEUANGAN', 'ongkir kurir'], ['MANAGER', 'KEUANGAN', 'cek kas'],
];
