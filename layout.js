/* LAYOUT KANTOR (dipakai office.js 3D dan topview.js denah atas, supaya posisi selalu sama).
   Kantor x 8.2..OFFICE_X2, z -6.1..6.1. Koridor di z=1.6 (sejajar pintu toko). Tiap ruangan punya pintu ke koridor.
   Baris utara : MANAGER | OPERASIONAL | MARKETING     Baris selatan: DEVELOPMENT | RAPAT | KEUANGAN
   Meja dibuat longgar (jarak antar meja >= 1 m, lorong di depan meja >= 1 m). Lorong di sebelah kursi dipakai juga sebagai jalur keluar. */
export const OFFICE_X2 = 27.6;
export const CORR_Z = 1.6;

/* ruangan: kotak + warna karpet + kotak tengah untuk label */
export const ROOMS = [
  { name: 'MANAGER',     x1: 8.2,  x2: 14.6, z1: -6.1, z2: .5,  rug: 0x2a2f3a, lab: [11.4, -5.2] },
  { name: 'OPERASIONAL', x1: 14.6, x2: 21.0, z1: -6.1, z2: .5,  rug: 0xb5502f, lab: [17.8, -5.2] },
  { name: 'MARKETING',   x1: 21.0, x2: 27.6, z1: -6.1, z2: .5,  rug: 0x9b3d78, lab: [24.3, -5.2] },
  { name: 'DEVELOPMENT', x1: 8.2,  x2: 18.4, z1: 2.7,  z2: 6.1, rug: 0x24508f, lab: [16.9, 3.25] },
  { name: 'RAPAT',       x1: 18.4, x2: 22.8, z1: 2.7,  z2: 6.1, rug: 0x4a5a48, lab: [20.6, 3.25] },
  { name: 'KEUANGAN',    x1: 22.8, x2: 27.6, z1: 2.7,  z2: 6.1, rug: 0x1f7a4d, lab: [25.2, 3.25] },
];

/* pintu ke koridor: x tengah, z dinding, sisi koridor (+1 = koridor di sebelah +z, -1 = di sebelah -z) */
export const DOORS = [
  { name: 'MANAGER', x: 12.9, z: .5, w: 1.4, side: 1 }, { name: 'OPERASIONAL', x: 17.9, z: .5, w: 1.4, side: 1 }, { name: 'MARKETING', x: 24.3, z: .5, w: 1.4, side: 1 },
  { name: 'DEVELOPMENT', x: 11.4, z: 2.7, w: 1.4, side: -1 }, { name: 'RAPAT', x: 19.4, z: 2.7, w: 1.6, side: -1 }, { name: 'KEUANGAN', x: 26.0, z: 2.7, w: 1.4, side: -1 },
];

/* agen: meja (x,z,w) + jalur keluar dari kursi sampai koridor. exit[0] = tempat berdiri di samping kursi (titik tamu). */
export const AGENTS = [
  { role: 'MANAGER',   room: 'MANAGER',     x: 10.6, z: -4.2, w: 2.6, exit: [[12.4, -3.35], [12.9, -3.35], [12.9, 0], [12.9, 1.6]] },
  { role: 'COMMERCE',  room: 'OPERASIONAL', x: 16.4, z: -3.9, w: 2.0, exit: [[17.65, -3.05], [17.9, -3.05], [17.9, 0], [17.9, 1.6]] },
  { role: 'LOGISTIK',  room: 'OPERASIONAL', x: 19.4, z: -3.9, w: 2.0, exit: [[18.15, -3.05], [17.9, -3.05], [17.9, 0], [17.9, 1.6]] },
  { role: 'CREATIVE',  room: 'MARKETING',   x: 22.7, z: -3.9, w: 2.0, exit: [[23.95, -3.05], [24.3, -3.05], [24.3, 0], [24.3, 1.6]] },
  { role: 'KONTEN IG', room: 'MARKETING',   x: 25.9, z: -3.9, w: 2.0, exit: [[24.65, -3.05], [24.3, -3.05], [24.3, 0], [24.3, 1.6]] },
  { role: 'DEVELOPER', room: 'DEVELOPMENT', x: 9.6,  z: 4.35, w: 2.2, exit: [[10.95, 5.2], [11.4, 5.2], [11.4, 3.3], [11.4, 1.6]] },
  { role: 'QA',        room: 'DEVELOPMENT', x: 13.2, z: 4.35, w: 2.2, exit: [[11.85, 5.2], [11.4, 5.2], [11.4, 3.3], [11.4, 1.6]] },
  { role: 'SECURITY',  room: 'DEVELOPMENT', x: 16.4, z: 4.35, w: 2.2, exit: [[14.8, 5.2], [14.8, 3.3], [11.4, 3.3], [11.4, 1.6]] },
  { role: 'KEUANGAN',  room: 'KEUANGAN',    x: 24.2, z: 4.35, w: 2.0, exit: [[25.6, 5.2], [26.0, 5.2], [26.0, 3.3], [26.0, 1.6]] },
].map(a => ({ ...a, seat: [a.x, a.z + .85], vis: a.exit[0] }));

/* jalur dari pintu dapur / taman (di topview) kembali ke koridor. Dapur masuk lewat lorong DEVELOPMENT, taman lewat pintu RAPAT. */
export const BREAK_EXIT = {
  KI: [[11.0, 6.9], [11.4, 5.9], [11.4, 5.2], [11.4, 3.3], [11.4, 1.6]],
  GI: [[19.4, 6.9], [19.4, 5.8], [19.4, 3.3], [19.4, 1.6]],
};

/* dinding sekat: potongan [x1,z1,x2,z2] dengan celah pintu. Dipakai sebagai tabrakan juga. */
export const WALLS = [
  [8.2, .5, 12.2, .5], [13.6, .5, 17.2, .5], [18.6, .5, 23.6, .5], [25.0, .5, 27.6, .5],           // sisi koridor utara
  [14.6, -6.0, 14.6, .5], [21.0, -6.0, 21.0, .5],                                                   // sekat antar ruangan utara
  [8.2, 2.7, 10.7, 2.7], [12.1, 2.7, 18.6, 2.7], [20.2, 2.7, 25.3, 2.7], [26.7, 2.7, 27.6, 2.7],                          // sisi koridor selatan
  [18.4, 2.7, 18.4, 6.0], [22.8, 2.7, 22.8, 6.0],                                                  // sekat DEVELOPMENT | RAPAT | KEUANGAN
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
  ['KEUANGAN', 'MANAGER', 'lapor kas'], ['COMMERCE', 'KEUANGAN', 'order lunas'], ['LOGISTIK', 'KEUANGAN', 'ongkir kurir'], ['MANAGER', 'KEUANGAN', 'cek kas'],
];
