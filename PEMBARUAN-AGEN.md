# Pembaruan: AI agent sungguhan (gratis)

## Yang berubah
**HP admin**: ikon toko (Berita, Diskusi, Lacak, Cek Resi, Pelunasan, Jurnal, Toko) dibuang. Isinya sekarang 8 aplikasi: Chat (beri tugas), Ringkasan, Karyawan (monitoring agen), Persetujuan, Draf, Laporan, Rutin, Setelan. File: `phone.js`, `aiapps.js` (baru), `aichat.js` (dipangkas), `style.css` (bagian bawah).

**Worker (`worker.js`)**
- Chat memakai 14 tool: baca produk/order/pengiriman/stok/laporan agen/draf/status situs, simpan draf, ajukan aksi, memori (`ingat`, `baca_memori`). Loop sampai 4 langkah. Langkah yang dipakai tampil di bawah jawaban.
- Memori jangka panjang (maks 20 catatan, bisa dihapus di Setelan).
- Tugas rutin: kamu atau agen (lewat persetujuan) membuat tugas harian di jam pilihan (WIB), maks 5. Cron menjalankannya maks 1 per 15 menit.
- Eksekutor: persetujuan bertipe `jadwal_rutin`, `hapus_rutin`, `ubah_setelan` DIJALANKAN kode setelah kamu setuju. Hasilnya dicatat.
- Monitoring nyata: tiap agen punya riwayat hasil, kegagalan tercatat, tombol "Jalankan sekarang". Tugas dari chat tercatat juga.
- Ringkasan memakai angka dari kode (tanpa AI). Order ditolak tidak lagi dihitung "belum lunas". Stok dibaca dari koleksi `stok` (sebelumnya membaca field `stok` produk yang tidak ada).
- Semua data aplikasi HP lewat Worker + service account, jadi tidak perlu menambah rules Firestore. Wajib: secret `FIREBASE_SA`.

## Batasan (jujur)
- Perubahan DATA TOKO (harga, stok, status order) dan posting Instagram TIDAK dieksekusi sistem. Persetujuan tipe `manual` hanya dicatat. Alasannya: stok ada di koleksi terpisah, harga tersimpan sebagai teks, dan ubah status order punya efek samping di web admin (stok dikembalikan, timeline). Mengeksekusinya dari Worker berisiko merusak data produksi.
- Kuota gratis tetap berlaku (Gemini, Groq, Workers AI). Aksi AI manual dibatasi 10/hari (konten, laporan, jalankan agen, rutin). Anggaran harian `AI_DAILY_CAP` hanya menghemat tugas terjadwal.
- Aktivitas "santai" agen adalah hiburan, ditandai di aplikasi Karyawan.
- Lolos: 30 tes Worker (Firestore & model tiruan) dan 23 tes UI di Chromium dengan Worker tiruan. BELUM diuji dengan key asli, Firestore asli, maupun HP fisik.

## Pasang
1. Timpa semua file di repo situs AI; `worker.js` + `wrangler.toml` ke repo Worker (atau tempel di dashboard Cloudflare).
2. Pastikan secret `GEMINI_API_KEY`, `GROQ_API_KEY`, `FIREBASE_SA` terisi. Variabel baru opsional: `STOK_MIN`.
3. Tes bertahap: buka Setelan (cek centang koneksi) > Chat "cek stok" > Karyawan > minta "jadwalkan cek stok tiap jam 7" lalu setujui di Persetujuan.
4. `chat.html` adalah halaman lama (masih ada `GANTI-SUBDOMAIN`); tidak dipakai lagi, boleh dihapus.

## Perbaikan model AI (26 Okt 2026)
- Gemini 2.5 Flash/Flash-Lite ditutup untuk akun baru (404) dan `llama-3.1-8b-instruct` di Workers AI dipensiunkan 2026-05-30. Bawaan sekarang: `gemini-flash-latest` (alias Flash terbaru) dan `@cf/google/gemma-4-26b-a4b-it` (cadangan `@cf/zai-org/glm-4.7-flash`).
- Model yang mati (404/deprecated) dilewati otomatis; kalau semua bawaan mati, Worker menanyakan daftar model aktif ke Gemini/Groq lalu memakainya.
- Nilai lama di Variables Cloudflare (`GEMINI_MODEL`, `CF_MODEL`) tidak lagi merusak: model baru tetap dicoba setelahnya. Tetap disarankan memperbarui atau menghapusnya.
- Key Gemini/Groq di-trim (spasi/enter ikut tersalin = "Invalid API Key").
- Error "Detail" kini tampil di chat agar penyebab kegagalan kelihatan.
- Groq: bawaan sekarang `openai/gpt-oss-120b` (cadangan `gpt-oss-20b`, `qwen/qwen3.8-27b`), sesuai daftar model di console Groq; `llama-3.3-70b-versatile` tidak tampil lagi di sana.

## Jurnal terbaca (26 Okt 2026)
- Sebelumnya fungsi `artikelTerbaru` mengirim query ke Firebase toko (`fvcktherules-store`), padahal artikel ada di Firebase Jurnal (`fvck-journal`), jadi hasilnya kosong dan errornya tertelan. Sekarang ke database yang benar.
- Tool baru `baca_jurnal`: artikel terbit terbaru (judul, kategori, ringkasan, tanggal, penanda AI) + post diskusi + 5 balasan terakhir per post. Hanya baca.
- Tanpa login dan tanpa secret baru: rules Jurnal mengizinkan baca artikel/post berstatus `published`. Draf artikel AI (status `draft`) sengaja tidak dibaca.
- Variabel opsional `JOURNAL_PROJECT_ID` (bawaan `fvck-journal`). Butuh composite index yang sudah ada di README Jurnal (status + publishedAt, status + createdAt); kalau error 400 di chat, buat index lewat link di console Firebase.
- Isi artikel, post, dan balasan diperlakukan sebagai data, bukan perintah (anti prompt-injection dari komentar pelanggan).
- Perbaikan: pencarian model aktif otomatis kini tetap jalan walau semua model bawaan sudah ditandai mati.
