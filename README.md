# OBE Master Pro - Kurikulum OBE & RPS Generator

Aplikasi Manajemen Kurikulum Outcome-Based Education (OBE) dan Pembuat Rencana Pembelajaran Semester (RPS) Otomatis.

---

## 🚀 Panduan Deploy ke GitHub & GitHub Pages

Aplikasi ini sudah dikonfigurasi penuh untuk siap di-deploy langsung ke **GitHub Pages**, **Vercel**, atau **Netlify**.

### Opsi 1: Otomatis via GitHub Actions (Sangat Direkomendasikan)

1. **Upload / Push Kode ke GitHub Repository Anda:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit OBE Master Pro"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

2. **Aktifkan GitHub Pages di Repository:**
   - Masuk ke repository Anda di GitHub.
   - Buka menu **Settings** > **Pages**.
   - Pada bagian **Build and deployment** > **Source**, pilih **GitHub Actions**.
   - Setiap kali Anda melakukan `git push` ke branch `main`, GitHub Actions akan otomatis membuat (*build*) dan mempublikasikan aplikasi ke URL GitHub Pages Anda (`https://USERNAME.github.io/NAMA-REPO/`).

---

### Opsi 2: Deploy Manual via Command Line (`npm run deploy`)

1. Buka terminal di direktori proyek.
2. Jalankan perintah:
   ```bash
   npm run deploy
   ```
3. Perintah ini akan otomatis menjalankan `npm run build` dan mengunggah folder `dist` ke branch `gh-pages` di repository GitHub Anda.
4. Di GitHub Settings > Pages, pastikan Source diatur ke branch `gh-pages`.

---

### Opsi 3: Deploy Ke Vercel (1-Click & Vercel CLI)

Aplikasi ini sudah dilengkapi dengan berkas `vercel.json` untuk otomatisasi konfigurasi Vercel:

#### **Metode A: Melalui Dashboard Vercel (Rekomendasi)**
1. Hubungkan akun GitHub Anda ke [Vercel.com](https://vercel.com).
2. Klik **Add New Project** > pilih repository GitHub proyek ini.
3. Vercel akan otomatis mendeteksi framework **Vite**:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Klik **Deploy**. Aplikasi akan aktif dalam beberapa detik dengan domain SSL gratis (`https://nama-proyek.vercel.app`).

#### **Metode B: Melalui Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy langsung dari terminal
vercel
```

---

## 🛠️ Pengembangan Lokal

```bash
# Install dependencies
npm install

# Jalankan server lokal
npm run dev

# Build untuk produksi
npm run build
```
