/* LAYOUT KANTOR (dipakai office.js 3D dan topview.js denah atas, supaya posisi selalu sama).
   Kantor x 8.2..22, z -6.1..6.1. Koridor di z=1.6 (sejajar pintu toko). Tiap ruangan punya pintu ke koridor.
   Baris utara : MANAGER | OPERASIONAL | MARKETING     Baris selatan: DEVELOPMENT | RAPAT          */
export const CORR_Z = 1.6;

/* ruangan: kotak + warna karpet + kotak tengah untuk label */
export const ROOMS = [
  { name: 'MANAGER',     x1: 8.2,  x2: 13.6, z1: -6.1, z2: .5,  rug: 0x2a2f3a, lab: [10.9, -5.2] },
  { name: 'OPERASIONAL', x1: 13.6, x2: 18.0, z1: -6.1, z2: .5,  rug: 0xb5502f, lab: [15.8, -5.2] },
  { name: 'MARKETING',   x1: 18.0, x2: 22.0, z1: -6.1, z2: .5,  rug: 0x9b3d78, lab: [20.0, -5.2] },
  { name: 'DEVELOPMENT', x1: 8.2,  x2: 17.2, z1: 2.7,  z2: 6.1, rug: 0x24508f, lab: [12.7, 5.5] },
  { name: 'RAPAT',       x1: 17.2, x2: 22.0, z1: 2.7,  z2: 6.1, rug: 0x4a5a48, lab: [19.6, 5.5] },
];

/* pintu ke koridor: x tengah, z dinding, sisi koridor (+1 = koridor di sebelah +z, -1 = di sebelah -z) */
export const DOORS = [
  { name: 'MANAGER', x: 12.5, z: .5, w: 1.4, side: 1 }, { name: 'OPERASIONAL', x: 17.0, z: .5, w: 1.4, side: 1 }, { name: 'MARKETING', x: 21.1, z: .5, w: 1.4, side: 1 },
  { name: 'DEVELOPMENT', x: 11.6, z: 2.7, w: 1.4, side: -1 }, { name: 'RAPAT', x: 18.4, z: 2.7, w: 1.6, side: -1 },
];

/* agen: meja (x,z,w) + jalur keluar dari kursi sampai koridor. exit[0] = tempat berdiri di samping kursi (titik tamu). */
export const AGENTS = [
  { role: 'MANAGER',   room: 'MANAGER',     x: 10.9, z: -4.2, w: 2.6, exit: [[12.5, -3.35], [12.5, 0], [12.5, 1.6]] },
  { role: 'COMMERCE',  room: 'OPERASIONAL', x: 15.4, z: -4.4, w: 2.0, exit: [[17.0, -3.55], [17.0, 0], [17.0, 1.6]] },
  { role: 'LOGISTIK',  room: 'OPERASIONAL', x: 15.4, z: -1.8, w: 2.0, exit: [[17.0, -.95], [17.0, 0], [17.0, 1.6]] },
  { role: 'CREATIVE',  room: 'MARKETING',   x: 19.4, z: -4.4, w: 2.0, exit: [[21.1, -3.55], [21.1, 0], [21.1, 1.6]] },
  { role: 'KONTEN IG', room: 'MARKETING',   x: 19.4, z: -1.8, w: 2.0, exit: [[21.1, -.95], [21.1, 0], [21.1, 1.6]] },
  { role: 'DEVELOPER', room: 'DEVELOPMENT', x: 10.2, z: 4.0,  w: 2.2, exit: [[8.7, 4.85], [8.7, 3.1], [11.6, 3.1], [11.6, 1.6]] },
  { role: 'QA',        room: 'DEVELOPMENT', x: 13.0, z: 4.0,  w: 2.2, exit: [[11.6, 4.85], [11.6, 3.1], [11.6, 1.6]] },
  { role: 'SECURITY',  room: 'DEVELOPMENT', x: 15.8, z: 4.0,  w: 2.2, exit: [[14.4, 4.85], [14.4, 3.1], [11.6, 3.1], [11.6, 1.6]] },
].map(a => ({ ...a, seat: [a.x, a.z + .85], vis: a.exit[0] }));

/* jalur dari pintu dapur / taman (di topview) kembali ke koridor */
export const BREAK_EXIT = {
  KI: [[11.0, 6.9], [11.0, 5.7], [11.6, 4.85], [11.6, 3.1], [11.6, 1.6]],
  GI: [[19.4, 6.9], [19.0, 5.0], [18.4, 3.1], [18.4, 1.6]],
};

/* dinding sekat: potongan [x1,z1,x2,z2] dengan celah pintu. Dipakai sebagai tabrakan juga. */
export const WALLS = [
  [8.2, .5, 11.8, .5], [13.2, .5, 16.3, .5], [17.7, .5, 20.4, .5], [21.8, .5, 22.0, .5],         // sisi koridor utara
  [13.6, -6.0, 13.6, .5], [18.0, -6.0, 18.0, .5],                                                   // sekat antar ruangan utara
  [8.2, 2.7, 10.9, 2.7], [12.3, 2.7, 17.6, 2.7], [19.2, 2.7, 22.0, 2.7],                           // sisi koridor selatan
  [17.2, 2.7, 17.2, 6.0],                                                                           // sekat DEVELOPMENT | RAPAT
];

/* sambung dua jalur keluar (seat -> koridor) jadi satu jalur jalan A -> B.
   Kalau dua jalur berpotongan di satu titik (satu ruangan) potong di titik itu, kalau tidak sambung lewat koridor. */
export function joinPath(ex1, ex2) {
  for (let i = 0; i < ex1.length; i++) {
    const j = ex2.findIndex(p => p[0] === ex1[i][0] && p[1] === ex1[i][1]);
    if (j >= 0) return ex1.slice(0, i + 1).concat(ex2.slice(0, j).reverse());
  }
  return ex1.concat(ex2.slice().reverse());
}

/* siapa melapor ke siapa (saling samper): [dari, ke, teks] */
export const LINKS = [
  ['COMMERCE', 'MANAGER', 'lapor order'], ['LOGISTIK', 'COMMERCE', 'kabar resi'], ['CREATIVE', 'KONTEN IG', 'brief caption'],
  ['KONTEN IG', 'COMMERCE', 'jadwal promo'], ['DEVELOPER', 'QA', 'minta tes'], ['QA', 'SECURITY', 'hasil tes'],
  ['SECURITY', 'MANAGER', 'lapor keamanan'], ['DEVELOPER', 'MANAGER', 'status patch'], ['CREATIVE', 'MANAGER', 'lapor konten'],
  ['MANAGER', 'DEVELOPER', 'cek progres'], ['MANAGER', 'LOGISTIK', 'cek pengiriman'], ['LOGISTIK', 'MANAGER', 'lapor kirim'],
];
