# SIAGA

SIAGA (Sistem Informasi Aspirasi & Gotong Royong Warga) adalah aplikasi web
untuk membantu pengurus dan warga mengelola informasi lingkungan secara
transparan dalam satu platform.

Aplikasi ini menyediakan landing page publik, portal warga, dan panel
administrasi untuk pengurus RT/RW.

## Fitur Utama

- Landing page informatif mengenai layanan SIAGA.
- Autentikasi warga dan admin melalui API backend.
- Dashboard warga untuk melihat ringkasan aktivitas lingkungan.
- Pengelolaan iuran dan keuangan warga.
- Pengajuan serta pemantauan aduan warga.
- Aspirasi, partisipasi, dan voting warga.
- Informasi keamanan lingkungan dan pemantauan CCTV.
- Profil warga.
- Dashboard admin untuk:
  - memantau statistik kas, iuran, aduan, dan CCTV;
  - memverifikasi pembayaran;
  - mengelola kas;
  - menindaklanjuti aduan;
  - mengelola voting dan pengumuman;
  - mengelola data warga;
  - mengatur sumber stream CCTV.
- Pembayaran menggunakan Midtrans Snap.
- Tampilan responsif untuk perangkat mobile dan desktop.

## Teknologi

- React 19
- Vite 8
- React Router
- Tailwind CSS 4
- Axios
- Recharts dan Chart.js
- Framer Motion
- Lucide React
- SweetAlert2
- Midtrans Snap

## Prasyarat

- Node.js `20.19+` atau `22.12+`
- npm
- Backend SIAGA yang menyediakan endpoint API

Versi Node.js di atas mengikuti persyaratan Vite yang digunakan oleh proyek.

## Instalasi

1. Clone repository dan masuk ke direktori proyek.

   ```bash
   git clone https://github.com/PradiptaAhmad/siaga
   cd siaga
   ```

2. Install dependency.

   ```bash
   npm install
   ```

3. Buat file `.env` di root proyek:

   ```env
   VITE_API_URL=/api
   VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxx
   VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
   ```

   `VITE_API_URL` dapat diisi dengan URL backend langsung, atau dibiarkan
   menggunakan `/api` agar request mengikuti proxy development Vite.

4. Jalankan server development.

   ```bash
   npm run dev
   ```

   Secara default, aplikasi tersedia di
   [http://localhost:5174](http://localhost:5174).

## Perintah NPM

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Menjalankan server development Vite |
| `npm run build` | Membuat build production |
| `npm run preview` | Menjalankan preview dari build production |

## Konfigurasi Development

Server Vite dikonfigurasi pada port `5174`. Pada development, request berikut
di-proxy ke backend lokal:

- `/api` -> `http://127.0.0.1:8000`
- `/storage` -> `http://127.0.0.1:8000`

Jika backend berjalan pada alamat lain, gunakan `VITE_API_URL` atau sesuaikan
konfigurasi proxy di `vite.config.js`.

Backend diharapkan menyediakan endpoint autentikasi seperti:

- `POST /login`
- `POST /logout`
- `GET /me`

Selain endpoint tersebut, halaman warga dan admin menggunakan endpoint sesuai
modul masing-masing. Pastikan backend, database, dan storage sudah berjalan
sebelum menguji fitur yang membutuhkan data.

## Route Aplikasi

### Publik

| Route | Keterangan |
| --- | --- |
| `/` | Landing page SIAGA |
| `/login` | Halaman login |

### Portal Warga

| Route | Keterangan |
| --- | --- |
| `/user/dashboard` | Dashboard warga |
| `/user/iuran` | Iuran dan keuangan |
| `/user/aduan` | Aduan dan permohonan |
| `/user/keamanan` | Keamanan dan CCTV |
| `/user/aspirasi` | Aspirasi dan partisipasi |
| `/user/profil` | Profil warga |

Route dengan awalan `/dashboard` juga tersedia sebagai alias portal warga.

### Panel Admin

| Route | Keterangan |
| --- | --- |
| `/admin` | Dashboard admin |
| `/admin/cctv` | Pengelolaan CCTV |
| `/admin/pembayaran` | Verifikasi pembayaran |
| `/admin/kas` | Pengelolaan kas |
| `/admin/aduan` | Pengelolaan aduan |
| `/admin/voting` | Pengelolaan voting |
| `/admin/pengumuman` | Pengelolaan pengumuman |
| `/admin/warga` | Pengelolaan data warga |

## Struktur Direktori

```text
.
├── public/                 # Favicon dan aset publik
├── src/
│   ├── 0landingPage/       # Section landing page
│   ├── 2userApps/          # Layout, halaman, dan route portal warga
│   ├── assets/             # Gambar dan aset aplikasi
│   ├── components/         # Komponen UI, landing, user, admin, dan security
│   ├── context/            # Context global, termasuk autentikasi
│   ├── lib/                # API client, cache, format, notifikasi, Midtrans
│   ├── pages/              # Halaman publik, login, user, dan admin
│   ├── App.jsx             # Konfigurasi route utama
│   ├── index.css           # Style global
│   └── main.jsx            # Entry point React
├── index.html
├── package.json
└── vite.config.js
```

## Autentikasi

Token dan data user disimpan pada `localStorage` dengan key:

- `siaga_token`
- `siaga_user`

Client Axios otomatis mengirim token melalui header otorisasi dan akan
membersihkan session jika backend mengembalikan status `401`.

Untuk login, warga menggunakan Nomor Induk Keluarga, sedangkan admin dapat
menggunakan email sesuai data yang terdaftar pada backend. Akun demo yang
tersedia pada halaman login hanya dapat digunakan jika backend menyediakan
akun demo tersebut.

## Pembayaran

Integrasi pembayaran menggunakan Midtrans Snap. Gunakan Client Key dan URL
Snap dari environment variable, terutama saat berpindah dari sandbox ke
production. Jangan menyimpan Server Key Midtrans di frontend atau di dalam
repository.

## Build Production

Buat build production dengan:

```bash
npm run build
```

Hasil build berada di direktori `dist/`. Untuk mengujinya secara lokal:

```bash
npm run preview
```

Saat melakukan deploy sebagai single-page application, server hosting perlu
mengarahkan fallback route ke `index.html` agar route React Router tetap dapat
diakses saat halaman direfresh.

## Catatan Pengembangan

- Jangan commit file `.env` atau credential yang bersifat rahasia.
- Pastikan backend mengizinkan origin frontend dan request `/api`.
- Gunakan Midtrans sandbox untuk development dan pengujian.
- Pastikan endpoint backend mengembalikan struktur data yang sesuai dengan
  kebutuhan halaman terkait.
