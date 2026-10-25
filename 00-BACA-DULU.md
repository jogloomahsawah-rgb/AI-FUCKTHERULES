# FVCKTHERULES — paket lengkap
1. `PANDUAN-API-KEY.md` : cara dapat semua API key + deploy. MULAI DARI SINI.
2. `1-ai-backend-dashboard/` : Worker multi-AI (saling mengecek), dashboard, widget admin, rules Firestore.
3. `2-game-office/` : game toko + pintu ke AI OFFICE (isi folder ini di-upload ke repo game, timpa file lama).
4. `3-demo-kantor-3d/fvck-office.html` : demo kantor isometrik (buka di browser, data simulasi).

Status jujur: kode lolos cek sintaks dan logika Worker diuji dengan penyedia tiruan, tetapi BELUM diuji dengan key asli maupun di browser/HP. Tes bertahap: Worker -> dashboard -> widget admin -> game.
Eksekutor aksi (menulis ke produksi, posting IG) belum dibuat; Midtrans di game tidak disentuh.
