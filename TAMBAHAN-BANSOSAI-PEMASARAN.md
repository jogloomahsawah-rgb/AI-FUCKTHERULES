# Tambahan: BansosAI + agen PEMASARAN

## 1. Provider BansosAI (opsional, bukan resmi)
- Gateway pihak ketiga `https://api.bansosai.app/v1` (format OpenAI). Model bawaan: `claude-sonnet-4-5`, cadangan `glm-5`, `deepseek-3.2`, `qwen-3-8-max` (cek ID persis di Model Studio).
- Pasang: `npx wrangler secret put BANSOS_API_KEY` (atau Cloudflare > Settings > Variables and Secrets > Secret). Jangan taruh key di repo/chat.
- Urutan: `MAKER_ORDER = "gemini,groq,bansos,cfai"`. Bansos hanya dicoba setelah Gemini dan Groq gagal.
- PENGAMAN: bansos HANYA untuk tugas "aman" (ide/caption/paket upload/strategi pemasaran). Chat admin, COMMERCE, LOGISTIK, KEUANGAN tidak pernah lewat bansos karena memuat data order/keuangan.
- Matikan total: `BANSOS_SCOPE = "off"` atau kosongkan key. Batas waktu 30 detik per panggilan.
- Status tampil di Setelan > Koneksi dan di laporan agen DEVELOPER (bansos tidak dihitung sebagai wajib).

## 2. Agen PEMASARAN (branding & pemasaran)
- Jadwal: Senin 07:00 WIB = rencana pemasaran 7 hari; Kamis 07:00 WIB = evaluasi singkat. Tombol "Jalankan sekarang" selalu membuat rencana. Biaya: 2 panggilan AI/minggu.
- Isi rencana: fokus terukur, 2 segmen audiens, peran tiap akun IG (corong wrongway -> fucktherules.exe -> breaktherules.forever -> toko/game/jurnal), jadwal 7 hari, satu kampanye/drop, aksi komunitas organik tanpa biaya, bukti kepercayaan, 3 eksperimen + metrik, risiko (logo klub/lagu berlisensi, isu sosial berimbang).
- AI tidak punya akses Instagram. Isi sendiri di Setelan: "Metrik Instagram minggu ini" dan "Sasaran bulan ini" supaya evaluasi berdasar angka nyata. Kosong = ditulis [perlu diisi admin].
- Hasil muncul di Setelan > Draf > chip "Strategi". KONTEN IG dan CREATIVE otomatis membaca strategi terbaru saat membuat ide dan caption.
- Kantor 3D: meja baru di ruang MARKETING (layout.js). Posisi meja BELUM dilihat di layar HP; kalau terlalu rapat, geser `z` pada entri PEMASARAN di `layout.js`.

## Status uji
Sintaks semua file lolos. Provider bansos dan job PEMASARAN diuji dengan server tiruan (bansos tidak dipakai untuk tugas tidak aman; data order tidak ikut terkirim). BELUM diuji dengan key asli, Firestore asli, atau tampilan di HP.

---
# Tambahan 2: kantor diperluas (pulau)
- Kantor jadi pulau 40 x 33 m (dulu 19 x 12 m) di tengah laut. Pintu masuk tetap di sisi kanan toko.
- Enam paviliun (MANAGER, OPERASIONAL, MARKETING, DEVELOPMENT, RAPAT, KEUANGAN) tidak lagi berimpitan: jarak antar ruangan minimal 3,6 m, tiap ruangan punya dinding dan atap sendiri. Isi dalam ruangan (meja, posisi agen) sama seperti sebelumnya.
- PLAZA terbuka di tengah (pohon besar, empat bangku). Timur: LOUNGE (sofa, meja biliar, bean bag) di utara, KOLAM RENANG dengan 4 sunbed dan payung di tengah, BAR (konter, rak botol, 5 bangku, atap rumbia) di selatan.
- Agen yang menganggur di tampak ATAS berjalan ke kolam, bar, lounge, atau plaza (maksimal 4 orang sekaligus), lalu kembali ke meja. Jalur jalan memakai graf jalan di `layout.js` (NODES/EDGES) supaya tidak menembus dinding atau kolam.
- Mau geser/tambah area: ubah `layout.js` saja (ROOMS lewat MOVE, DECOR untuk benda, LEISURE untuk tempat duduk agen). office.js dan topview.js membaca data yang sama. File `denah-baru.png` = gambar denah tampak atas.
- Versi cache impor dinaikkan (layout v4, office v9, topview v7). Kalau tampilan masih lama, hard refresh atau hapus cache situs.
- Diuji: jalur 10 agen x 10 agen, ke semua tempat santai, dan jalur KASIR-AI lolos cek tabrakan dinding/benda (skrip). Modul office dan topview jalan tanpa error dengan Three.js tiruan. BELUM dilihat langsung di layar HP: kemungkinan perlu tweak posisi dekor dan performa di HP lemah (kalau berat, kurangi `tree(...)` di layout.js atau turunkan kualitas grafis).
