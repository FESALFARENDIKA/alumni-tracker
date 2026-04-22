# Alumni Tracker - OSINT Environment

[![Live Web](https://img.shields.io/badge/Live-Web%20App-brightgreen)](http://alumni-tracker.infinityfreeapp.com)
[![Database](https://img.shields.io/badge/Database-Supabase-blue)](https://supabase.com)
[![OSINT](https://img.shields.io/badge/OSINT-SerpAPI-orange)](https://serpapi.com)

Alumni Tracker adalah sistem pemantauan dan pelacakan alumni berbasis intelijen sumber terbuka (OSINT) yang dirancang untuk mengelola lebih dari 142.000 data alumni. Sistem ini mengintegrasikan basis data dengan pencarian profil media sosial secara otomatis menggunakan SerpAPI dan menyimpan hasil pelacakan pada basis data cloud Supabase.

## Fitur Utama

- **Alumni Tracker**: Pencarian nama alumni yang komprehensif didukung oleh pemrosesan data asinkron. Fitur ini memungkinkan ekstraksi otomatis informasi karir (posisi, tempat kerja), kontak (email, nomor telepon), serta profil media sosial (LinkedIn, Instagram, Facebook, TikTok).
- **Track Pendidikan (PDDIKTI)**: Modul pencarian dan verifikasi data riwayat studi akademik secara real-time yang terhubung langsung ke Pangkalan Data Pendidikan Tinggi (PDDIKTI) Kementerian Pendidikan dan Kebudayaan.
- **Summary Alumni**: Dasbor analitik interaktif yang menampilkan statistik pelacakan secara dinamis langsung dari data Supabase, mencakup rasio penemuan data dan progres pelacakan per tahun kelulusan.
- **Hasil Tracking**: Antarmuka tabular yang komprehensif untuk meninjau secara mendetail data alumni yang telah berhasil dilacak.

## Arsitektur Sistem

- **Frontend**: React.js (Vite), komponen Recharts untuk visualisasi data, Lucide Icons, Vanilla CSS dengan pendekatan desain modern (Glassmorphism).
- **Backend & Integrasi API**: Node.js (Express) untuk proxy API PDDikti dan pemrosesan SerpAPI.
- **Database**: Supabase (PostgreSQL) untuk penyimpanan data hasil OSINT.
- **Deployment**: InfinityFree (Static Hosting) dengan integrasi proxy PHP.

## Panduan Instalasi & Menjalankan Aplikasi

### Persyaratan Sistem
- Node.js dan npm
- Akun Supabase (PostgreSQL)
- Kunci API SerpAPI (untuk modul OSINT)

### Instalasi Lokal
1. Klon repositori ini:
   ```bash
   git clone https://github.com/FESALFARENDIKA/alumni-tracker.git
   cd alumni-tracker
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi kredensial lingkungan di `.env`:
   ```bash
   VITE_SUPABASE_URL=URL_SUPABASE_ANDA
   VITE_SUPABASE_ANON_KEY=KEY_SUPABASE_ANDA
   ```
4. Jalankan server backend (untuk proxy API PDDikti & OSINT):
   ```bash
   npm run server
   ```
   *Atau*
   ```bash
   node server.js
   ```
5. Jalankan aplikasi frontend (pada terminal yang berbeda):
   ```bash
   npm run dev
   ```

## Catatan Rilis

- Pembaruan penamaan navigasi antarmuka untuk standardisasi produk ("Excel Search" menjadi "Alumni Tracker", "Radar Board" menjadi "Summary Alumni").
- Sinkronisasi modul Hasil Tracking dan Summary Alumni agar membaca langsung dari tabel database (Supabase), mencegah galat (error) pada panggilan API PDDikti ganda.
- Penyesuaian antarmuka pengguna untuk menampilkan informasi OSINT secara lebih rinci (email, nomor kontak, dan riwayat pekerjaan).
- Perbaikan rute proxy pada Node Server lokal untuk memulihkan integrasi ke PDDikti.

---
**DISCLAIMER:** Sistem ini dikembangkan untuk keperluan akademik dan penelitian intelijen sumber terbuka. Seluruh data yang diproses harus dijaga kerahasiaannya sesuai regulasi privasi yang berlaku dan dilarang disalahgunakan untuk keperluan komersial tanpa izin.
