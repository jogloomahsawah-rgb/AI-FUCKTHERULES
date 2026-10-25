# Paket perbaikan fvck-ai (semua gratis)

File: worker.js, wrangler.toml (taruh di repo, Workers Builds deploy otomatis), aichat.js, office.js, topview.js (timpa di repo ai.fucktherules.my.id).

## 1. Chat tidak lagi "Semua model gagal"
Gemini (2 model) -> Groq (2 model) -> Workers AI (tanpa key, selalu cadangan terakhir). Error menampilkan penyebab asli.
WAJIB: binding Workers AI `AI` (otomatis lewat [ai] di wrangler.toml).

## 2. Hemat kuota AI
- Chat: jawaban sama dalam 2 menit diambil dari cache; klik ganda/retry digabung jadi 1 panggilan; riwayat dipangkas (8 pesan); tool maks 3 putaran.
- Tugas terjadwal: AI dipanggil hanya jika data berubah (COMMERCE, LOGISTIK); CREATIVE maks 3/hari, KONTEN IG maks 2/hari; tanpa cek silang (CROSSCHECK_JOBS=off). QA, SECURITY, DEVELOPER sama sekali tanpa AI.
- Anggaran harian AI_DAILY_CAP (default 120): kalau tercapai, tugas terjadwal jalan tanpa AI (angka dari kode) atau ditunda. Chat manual TIDAK pernah diblokir.
- Perkiraan pemakaian terjadwal: sekitar 10-25 panggilan/hari, jauh di bawah batas gratis Gemini/Groq.
- Hitungan anggaran bersifat perkiraan (tidak atomik). Butuh secret FIREBASE_SA.

## 3. Jadwal (WIB, cron tiap 15 menit, maks 2 tugas per tik)
ORCHESTRATOR 08 & 20 (laporan) | COMMERCE 08-22 tiap 45 mnt | LOGISTIK 10 & 16 | KONTEN IG 09:00 (1 ide/hari) | CREATIVE 10:00 (caption matang + paket upload mingguan) | QA tiap 3 jam | SECURITY 22:00 | DEVELOPER 23:00. Ubah di JADWAL di worker.js.

## 3b. Konten harian (baru)
- Satu ide + satu caption matang per hari. Rotasi default 4 hari lalu mengulang: (1) @fucktherules.exe, (2) kolaborasi FTR x arsip @breaktherules.forever, (3) kolaborasi FTR x website (@wfactory.web + 3 domain), (4) kolaborasi FTR x isu sosial @wrongway3404. Semua kolaborasi ditulis sebagai Collab post Instagram.
- Tema per akun: @fucktherules.exe (utama/kolaborasi), @breaktherules.forever (arsip pakaian), @wrongway3404 (grafis isu sosial & sepakbola), @wfactory.web (jasa website), Website & jurnal (3 domain), plus Instagram umum, Branding, Produk selanjutnya, Promosi produk, Di balik layar.
- Identitas: FUCK THE RULES = pakaian streetwear sepakbola bertema kebebasan ("Love Football, Live Wild"). Tema Branding disesuaikan per bidang (pakaian, grafis, website, game, jurnal) bergantian tiap hari.
- Mengikuti perkembangan: tiap membuat konten AI membaca (a) artikel jurnal terbaru dari koleksi Firestore `articles` (hanya baca), (b) kolom "Momen & tren terkini" yang kamu isi di Setelan, (c) judul berita bola dari feed RSS di `TREND_FEEDS` (judul saja, dianggap sinyal tren, bukan fakta; Worker tidak punya pencarian web). Matikan feed dengan TREND_FEEDS = "".
- Aturan konten: AI dilarang mengarang fakta/angka/skor/harga/klien; yang tidak ada di data ditulis [perlu diisi admin]. Konten isu sosial (wrongway) menandai klaim yang harus kamu verifikasi dulu, dan tidak membuat prediksi pertandingan.
- Upload per minggu (0-3) dan harinya diatur di HP. Di hari upload, AI memilih konten terbaik minggu itu jadi "paket siap upload" (judul, hook, caption final, hashtag, brief visual, jam posting, checklist). Default 1x/minggu, hari Jumat.
- Mode Otomatis / Manual. Manual: tidak ada panggilan AI terjadwal; tombol "Buat konten sekarang" (maks 10/hari).
- Satu draft per hari (ID tetap), jadi tidak bisa dobel walau cron/refresh berulang. Kalau AI gagal, dicoba lagi di jam yang sama (tanpa menghabiskan jatah).
- Biaya: 2 panggilan AI/hari + 1/minggu.
- BELUM ada auto-post ke Instagram (butuh Meta API + persetujuan). Posting dilakukan manual.
- Setelan disimpan di Firestore aiAgents/SETTINGS lewat Worker (butuh secret FIREBASE_SA).

## 3c. Aplikasi AI di HP
Hanya dua tab: Chat dan Setelan. Persetujuan, Draft, dan Tim ada di Setelan (bagian lipat di bawah).

## 4. Status & aktivitas santai
/status sekarang memberi mode: kerja / selesai / santai, lengkap emoji, keterangan, jam kerja, dan jadwal berikutnya. Saat tidak ada tugas agen "nonton YouTube, tiktokan, ngopi, dll" (berganti tiap 20 menit). Itu HIBURAN, ditandai jelas, bukan pekerjaan nyata.
Tampil di: tab "Tim" di aplikasi AI (HP), papan layar meja di kantor 3D, denah atas, dan teks saat tekan E pada agen. Kantor 3D polling tiap 60 detik; kalau Worker tidak terjangkau, kantor kembali ke simulasi lama.

## Pasang
1. Commit semua file ke repo masing-masing (worker.js + wrangler.toml ke repo Worker; sisanya ke repo situs AI).
2. Secret tetap di Cloudflare: GEMINI_API_KEY, GROQ_API_KEY, FIREBASE_SA.
3. Tes: kirim "halo" di chat; buka tab Tim; tunggu cron (15 menit) lalu cek status agen.
