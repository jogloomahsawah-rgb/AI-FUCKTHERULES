# Panduan API key (semua gratis, tanpa kartu kredit untuk yang di bawah)
Tampilan situs bisa berubah; kalau menu beda, cari kata kuncinya. Batas gratis tiap layanan berubah-ubah, cek di situs masing-masing.

## 1. Gemini (pembuat utama)
1. Buka https://aistudio.google.com/apikey dan login Google.
2. Klik **Create API key** (pilih/buat project bila diminta).
3. Salin key (diawali `AIza...`). Simpan di catatan pribadi.

## 2. Groq (pembuat cadangan + pemeriksa)
1. Buka https://console.groq.com dan daftar.
2. Menu **API Keys** -> **Create API Key**, beri nama `fvck-ai`.
3. Salin key (diawali `gsk_...`). Biasanya hanya tampil sekali.
4. Cek nama model terbaru di console, lalu isi `GROQ_MODEL` di `wrangler.toml`.

## 3. Cloudflare (hosting Worker + Workers AI)
1. Daftar gratis di https://dash.cloudflare.com
2. Workers AI tidak butuh API key: cukup binding `AI` (sudah ada di `wrangler.toml`).
3. Pilih SALAH SATU cara deploy:

### Cara A — dari HP (tanpa terminal)
1. Dashboard Cloudflare -> **Workers & Pages** -> **Create** -> **Worker** -> beri nama `fvck-ai` -> Deploy.
2. **Edit code** -> hapus isinya -> tempel isi `worker/worker.js` -> Deploy.
3. **Settings -> Variables and Secrets**:
   - Tipe *Secret*: `GEMINI_API_KEY`, `GROQ_API_KEY`
   - Tipe *Text*: semua isi `[vars]` di `wrangler.toml` (FIREBASE_PROJECT_ID, FIREBASE_API_KEY, ADMIN_EMAILS, ALLOWED_ORIGINS, GEMINI_MODEL, GROQ_MODEL, CF_MODEL, MAKER_ORDER, CROSSCHECK)
4. **Settings -> Bindings -> Add -> Workers AI**, nama variabel `AI`.
5. Salin URL Worker (`https://fvck-ai.<akun>.workers.dev`).

### Cara B — dari PC (terminal)
```
cd worker
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler deploy
```
Perlu Node.js terpasang (nodejs.org).

## 4. Firebase (login + database, sudah ada)
1. Console Firebase -> project `fvcktherules-store` -> **Authentication -> Sign-in method**: pastikan **Google** aktif.
2. **Authentication -> Settings -> Authorized domains**: tambahkan domain dashboard AI dan `game.fucktherules.my.id`.
3. **Firestore -> Rules**: tempel isi `firestore.rules.tambahan` ke rules toko (di dalam `match /documents`), lalu **Publish**.
4. Key Firebase `AIzaSy...` di kode adalah key web publik, bukan rahasia.

## 5. Sambungkan semuanya
1. Ganti `https://fvck-ai.GANTI-SUBDOMAIN.workers.dev` dengan URL Worker-mu di: `dashboard/index.html` dan `admin-ai.js`.
2. Tambahkan alamat dashboard, game, dan toko ke `ALLOWED_ORIGINS` Worker (pisahkan koma), mis. `https://ai.fucktherules.my.id,https://game.fucktherules.my.id,https://fucktherules.my.id`.
3. (Opsional) laporan order di game: isi `AI_WORKER` di `2-game-office/office.js`.
4. Tes: buka dashboard, login Google admin, ketik "ringkas order". Di bawah jawaban harus muncul `[gemini → dicek groq: OK]`.

## Aturan keamanan key
- Jangan tempel key di chat, screenshot, atau file di repo. Simpan hanya sebagai Secret di Cloudflare.
- Kalau key bocor: hapus di situs penyedia, buat baru, perbarui Secret.
- Jangan buat banyak akun untuk menembus batas gratis (biasanya melanggar syarat layanan).
- Kalau muncul error 429, artinya kuota gratis sedang habis; Worker akan pindah ke model lain.
