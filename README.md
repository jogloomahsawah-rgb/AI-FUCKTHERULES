# ai.fucktherules.my.id
Kantor AI 3D KHUSUS ADMIN (bukan untuk pelanggan). Login Google admin dulu. HP di atas berisi 8 aplikasi AI: Chat, Ringkasan, Karyawan, Persetujuan, Draf, Laporan, Rutin, Setelan (lihat PEMBARUAN-AGEN.md).
Isi URL Worker di `config.js` (cari GANTI-SUBDOMAIN).
Denah kantor (ruangan, pintu, meja, siapa lapor ke siapa) ada di `layout.js`, dipakai bareng oleh `office.js` (3D) dan `topview.js` (denah atas).
Kamera orang ketiga di kantor memeriksa sekat (office.js `inside`), jadi tidak tembus ke ruangan sebelah. Lampu kantor bertingkat: 2 lampu di kualitas rendah / HP, 4 lampu di kualitas tinggi (diatur di game.js `setQ`).
Kantor dilebarkan (x sampai 27.6, atur di `OFFICE_X2` dalam layout.js). Agen duduk di kursi di 3D, dan di tampilan ATAS agen menghadap meja.
