# 🛡️ Alumni Tracker v2.0 - OSINT Environment

[![Live Web](https://img.shields.io/badge/Live-Web%20App-brightgreen)](http://alumni-tracker.infinityfreeapp.com)
[![Database](https://img.shields.io/badge/Database-Supabase-blue)](https://supabase.com)
[![OSINT](https://img.shields.io/badge/OSINT-SerpAPI-orange)](https://serpapi.com)

**Alumni Tracker** adalah sistem pemantauan dan pelacakan alumni berbasis digital (OSINT) yang dirancang untuk mengelola **142,000+ data alumni**. Sistem ini mengintegrasikan basis data Excel dengan pencarian profil media sosial secara otomatis menggunakan **SerpAPI** dan **Supabase**.

## 🚀 Fitur Utama
- **Fuzzy Search (142k Records)**: Pencarian nama alumni yang sangat cepat didukung oleh index GIN di PostgreSQL/Supabase.
- **On-Demand OSINT Discovery**: Melacak profil LinkedIn, Instagram, Facebook, dan TikTok alumni berdasarkan data akademik (Prodi & Fakultas).
- **Secure Dashboard**: Sistem terlindungi oleh otentikasi admin.
- **Pagination & Filters**: Navigasi data bervolume besar secara efisien.

## 📊 Pengujian Kualitas (Daily Project 3)

| Aspek Kualitas | Kasus Uji | Hasil yang Diharapkan | Status |
|---|---|---|---|
| **Keamanan** | Login dengan kredensial yang salah | Sistem menolak akses dan menampilkan pesan error | ✅ Berhasil |
| **Integritas Data** | Pencarian nama "Mochammad Azizil Akbar" | Sistem mengembalikan data yang benar dari 142k record | ✅ Berhasil |
| **Keandalan** | Pelacakan OSINT (SerpAPI) | Mengembalikan link profil publik yang valid (LI, IG, FB) | ✅ Berhasil |
| **Performa** | Loading data dengan pagination | Transisi antar halaman data di bawah 1 detik | ✅ Berhasil |
| **Usabilitas** | Tampilan Desktop & Mobile | Antarmuka responsif dan mudah digunakan | ✅ Berhasil |

## 🛠️ Arsitektur Sistem
- **Frontend**: React.js, Lucide Icons, Vanilla CSS (Glassmorphism).
- **Database**: Supabase (PostgreSQL).
- **Cloud Hosting**:
    - **Frontend**: InfinityFree (Static Hosting).
    - **API Proxy**: Render (Node.js Environment).
- **OSINT Engine**: SerpAPI (Google Search Engine API).

## 📦 Panduan Instalasi & Deploy

### Prerequisites
- Node.js & npm
- Akun Supabase & SerpAPI

### Local Setup
1. Clone repository:
   ```bash
   git clone https://github.com/FESALFARENDIKA/alumni-tracker.git
   cd alumni-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup `.env`:
   ```bash
   VITE_SUPABASE_URL=URL_SUPABASE_ANDA
   VITE_SUPABASE_ANON_KEY=KEY_SUPABASE_ANDA
   ```
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

### Deploy ke InfinityFree
1. Lakukan build produksi:
   ```bash
   npm run build
   ```
2. Upload seluruh isi folder `dist` ke dalam folder `htdocs` di InfinityFree (via FTP atau File Manager).

---
**DISCLAIMER:** Sistem ini dibuat untuk kepentingan pembelajaran. Data alumni harus dijaga kerahasiaannya dan tidak digunakan untuk kepentingan komersial tanpa izin.
