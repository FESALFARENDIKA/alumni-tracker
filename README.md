# Alumni Tracker - OSINT Environment

Alumni Tracker merupakan sistem pemantauan dan pelacakan alumni berbasis Intelijen Sumber Terbuka (OSINT) yang dirancang untuk mengelola serta memvalidasi data alumni dalam skala besar (142.000+ records). Sistem ini mengintegrasikan basis data akademik dengan mesin pencari profil digital secara otomatis untuk mendukung pemutakhiran data karier dan domisili alumni secara real-time.

## Fitur Utama

- **Alumni Tracker**: Modul pencarian berbasis data Excel yang mendukung pelacakan otomatis profil profesional, kontak, dan posisi pekerjaan melalui integrasi API pihak ketiga.
- **Track Pendidikan (PDDIKTI)**: Fitur verifikasi status mahasiswa dan riwayat studi yang terhubung melalui jalur proxy ke Pangkalan Data Pendidikan Tinggi.
- **Summary Alumni**: Dasbor analitik untuk memvisualisasikan progres pelacakan, rasio penemuan data, dan distribusi alumni berdasarkan tahun kelulusan secara dinamis.
- **Hasil Tracking**: Manajemen basis data cloud yang menyimpan informasi detail hasil ekstraksi OSINT untuk keperluan validasi lanjutan.

## Akun Akses Demonstrasi

Gunakan kredensial berikut untuk mengakses antarmuka administrasi:

- **Username**: ffarenadmin229#
- **Password**: isaladmin992@

## Pengujian Kualitas (Quality Assurance)

Berikut adalah tabel hasil pengujian sistem berdasarkan aspek kualitas yang telah ditentukan pada fase desain:

| Aspek Kualitas | Kasus Uji | Hasil yang Diharapkan | Status |
|---|---|---|---|
| Keamanan (Security) | Akses halaman admin tanpa autentikasi | Sistem melakukan proteksi dan mengarahkan pengguna kembali ke halaman login | Berhasil |
| Integritas Data | Pencarian nama spesifik dari 142k data | Sistem menampilkan informasi yang akurat sesuai dengan record pada basis data Excel | Berhasil |
| Keandalan (Reliability) | Ekstraksi data OSINT melalui SerpAPI | Sistem berhasil mendapatkan link profil publik (LinkedIn/IG) dan melakukan parsing data karier | Berhasil |
| Efisiensi Performa | Transisi halaman pada volume data besar | Fitur pagination mampu merespons navigasi data dalam waktu di bawah 1 detik | Berhasil |
| Usabilitas (Usability) | Responsivitas antarmuka pada berbagai perangkat | Elemen UI menyesuaikan tata letak secara proporsional pada resolusi desktop maupun mobile | Berhasil |

## Arsitektur Sistem

- **Frontend**: React.js (Vite), Recharts (Visualisasi Data), Lucide Icons, Vanilla CSS.
- **Database**: Supabase (PostgreSQL) sebagai penyimpanan cloud utama.
- **Backend & Proxy**: Node.js (Express) untuk menangani komunikasi API eksternal dan bypass CORS.
- **OSINT Provider**: SerpAPI untuk otomatisasi pencarian pada mesin pencari Google.

## Panduan Instalasi Lokal

1. Klon repositori:
   ```bash
   git clone https://github.com/FESALFARENDIKA/alumni-tracker.git
   ```
2. Instalasi dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi variabel lingkungan (.env):
   ```bash
   VITE_SUPABASE_URL=YOUR_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_KEY
   ```
4. Menjalankan server backend:
   ```bash
   node server.js
   ```
5. Menjalankan aplikasi frontend:
   ```bash
   npm run dev
   ```

---
**Pernyataan Penyangkalan (Disclaimer):** Sistem ini dikembangkan untuk tujuan akademik dan riset teknologi informasi. Penggunaan data harus mematuhi regulasi privasi yang berlaku dan dilarang digunakan untuk kepentingan komersial tanpa persetujuan pihak terkait.
