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

## Karyawan baru: KEUANGAN (baca-saja)
- Membaca koleksi `transaksi` di Firebase aplikasi keuangan (`keuangan-fvck`). TIDAK menulis, mengubah, atau menghapus apa pun; di tes, semua permintaan ke Firebase keuangan hanya query baca.
- Tool `ringkas_keuangan` (Chat, atau chip "Keuangan"): saldo (dihitung agregasi di server Firestore), pemasukan/pengeluaran/laba kaos bulan ini, bulan lalu, tren 6 bulan, 5 pengeluaran terbesar. Aturan hitung sama dengan aplikasi keuangan (laba kaos = pemasukan kaos - vendor - perlengkapan; transaksi dihapus tidak dihitung).
- Peringatan dari kode (bukan AI): saldo negatif, pengeluaran > 1,5x rata-rata 3 bulan dan selisih > Rp100.000, pengeluaran melebihi pemasukan, belum ada pemasukan setelah tanggal 10.
- Pencocokan order: membandingkan 300 order terbaru di toko dengan transaksi otomatis (aturan sama dengan `sync()` keuangan: DP = nominal DP; lunas/selesai/dikirim = total - ongkir). Melaporkan order yang belum tersinkron, nominal berbeda, dan transaksi yatim. Sinkron di keuangan hanya berjalan saat aplikasinya dibuka, jadi selisih bisa muncul wajar. Kalau aturan di `app.js` keuangan berubah (STATUS_PENUH, HITUNG_ONGKIR), ubah juga di `selisihOrder` pada worker.js.
- Jadwal otomatis jam 19:00-20:00 WIB (sebelum laporan 20:00). AI dipakai hanya bila data berubah; tombol "Jalankan sekarang" selalu menyegarkan. Hasil masuk Karyawan, Laporan, dan kartu Keuangan di Ringkasan.
- Karakter KEUANGAN sekarang punya ruangan sendiri di kantor 3D (sebelah RAPAT, pintu di koridor selatan), lengkap dengan papan grafik hidup, koin berputar, dan layar yang berdenyut saat bekerja. Ia ikut saling samper dengan MANAGER, COMMERCE, dan LOGISTIK. RAPAT dipersempit dan mejanya dipindah. Total agen jadi 11.

### Pasang
1. Google Cloud Console > project `keuangan-fvck` > IAM & Admin > Service Accounts > buat akun baru > beri role **Cloud Datastore Viewer** > tab Keys > Add key > JSON.
2. Cloudflare Worker > Settings > Variables and Secrets > tambah Secret `FIREBASE_SA_KEUANGAN` berisi seluruh isi JSON itu. Jangan tempel di chat atau commit ke GitHub.
3. Deploy ulang `worker.js`. Cek Setelan: "Keuangan ✓". Lalu Chat > chip "Keuangan".
- Tanpa secret itu, fitur keuangan diam (label "Belum terhubung"), tidak ada error. Jika muncul 403, role belum cukup/belum aktif (butuh beberapa menit).
- Agen KEUANGAN mengenal kelompok `ongkir` dari tab Ongkir baru: `bulan_ini.ongkir` (masuk, keluar, selisih) dan `keluar_per_grup.ongkir`; ongkir tidak masuk hitungan laba kaos.

## Pencarian order (cari_order)
- Agen sekarang punya tool `cari_order`: cari order berdasarkan nama pelanggan, kode order (mis. SLMN-58BAEV), id, atau nomor WA. Sebelumnya agen hanya melihat ringkasan dan 20 contoh yang belum lunas, jadi nama atau kode tertentu dibilang "tidak ditemukan" padahal ada.
- Pencocokan nama dilakukan di kode Worker (500 order terbaru); data pribadi tidak dikirim mentah ke model. Hasilnya status, total, ongkir, DP, produk.
- Deploy ulang worker.js.
