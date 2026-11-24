# Pembaruan: riwayat chat, agen bekerja, tanpa batas waktu

Berkas yang berubah: `aiapps.js`, `office.js`, `style.css`, `phone.js` (versi), `game.js` (versi), `index.html` (versi). Worker (`worker.js`) tidak berubah.

- **Riwayat chat:** di aplikasi Chat (di HP kantor) ada tombol **☰ Riwayat** (daftar percakapan, buka lagi, hapus) dan **＋ Baru**. Percakapan lama (satu utas) otomatis jadi riwayat pertama. Disimpan di browser perangkat ini (`localStorage`), maksimal 40 percakapan.
- **Agen bekerja:** saat Anda mengirim perintah, agen yang terkait langsung terlihat bekerja di kantor (3D dan tampak atas) dan muncul kapsul kuning beranimasi di atas chat. Contoh: “Penjualan sepi, gimana strategimu” → Pemasaran, Konten IG, Orchestrator. Selesai → kembali santai. Status dari Worker tidak menimpa agen yang sedang dikerjakan lewat chat.
- **Tanpa batas waktu:** chat menunggu selama apa pun jawabannya; tampil hitungan detik. Tidak ada pembatalan otomatis.
- Kata kunci → agen: pemasaran/strategi/sepi → Pemasaran+Konten IG; konten/IG/caption → Konten IG+Creative; desain/foto → Creative; stok/kirim/resi → Logistik; keuangan/kas/uang → Keuangan; order/produk/harga → Commerce; error/web/situs → QA+Developer; keamanan → Security; ringkas/laporan/gimana → Orchestrator.
