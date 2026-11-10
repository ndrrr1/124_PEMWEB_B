Nama: NDARU SATRIA TAMA  
NRP: 5027251124

# Inventra — Inventaris Barang

Inventra adalah aplikasi web untuk mencatat barang, stok, dan harga satuan. Pengguna dapat menambah, mencari, mengubah, dan menghapus barang. Data disimpan di PostgreSQL dan diakses melalui REST API menggunakan Express dan Prisma.

## Fitur

- Tambah, lihat, edit, dan hapus barang.
- Cari barang berdasarkan nama atau kode, lalu saring berdasarkan kategori.
- Lihat jumlah jenis barang, total stok, dan nilai persediaan.
- Penanda **Menipis** untuk stok 1–5 dan **Habis** untuk stok 0.
- Validasi input dan penolakan kode barang yang sudah digunakan.
- Data contoh dan collection Postman untuk mencoba API.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, dan Fetch API |
| Server | Node.js dan Express 5.1.0 |
| ORM | Prisma dan Prisma Client 7.10.1 |
| Koneksi database | `@prisma/adapter-pg` 7.10.1 dan `pg` 8.22.0 |
| Database | PostgreSQL, dengan konfigurasi koneksi untuk Neon |
| Konfigurasi | `dotenv` 17.2.3 |
| Pengujian | Node.js Test Runner dan Postman |

Frontend dan API dijalankan dari server Express yang sama.

## Menjalankan Proyek

Siapkan Node.js, npm, dan database PostgreSQL. Petunjuk bawaan proyek menggunakan Node.js 24.x dan Neon. Rentang Node.js pada `package.json` adalah `^22.12.0 || ^24.0.0 || >=26.0.0`.

Buka terminal di folder yang berisi `package.json`, lalu jalankan:

```bash
npm ci
npm run demo
```

Jika koneksi belum diatur, terminal akan meminta connection string. Salin URL PostgreSQL dengan pooling aktif dari menu **Connect** di project Neon, lalu tempelkan.

Skrip akan menyimpan konfigurasi, membuat Prisma Client, menerapkan migrasi, menambahkan data contoh, dan menjalankan server.

Setelah muncul **INVENTRA SIAP**, buka alamat Website yang tercetak di terminal. Port awalnya adalah [http://localhost:3000](http://localhost:3000). Jika port sedang dipakai, server mencoba hingga sembilan port berikutnya.

Biarkan terminal terbuka selama aplikasi digunakan. Tekan `Ctrl+C` untuk menghentikannya. Di Windows, langkah instalasi dan persiapan ini juga bisa dijalankan dengan membuka `JALANKAN.cmd`.

### Konfigurasi .env

Untuk mengisi konfigurasi sendiri, salin `.env.example` menjadi `.env`. Isi `DATABASE_URL` dengan URL database milik sendiri:

```dotenv
DATABASE_URL="TEMPEL_CONNECTION_STRING_NEON"
DATABASE_URL_UNPOOLED=""
PORT=3000
```

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Wajib diisi. Digunakan untuk koneksi aplikasi |
| `DATABASE_URL_UNPOOLED` | Koneksi direct untuk migrasi. Boleh kosong; kode menurunkannya dari URL Neon dengan menghapus `-pooler` pada hostname |
| `PORT` | Port awal server; default 3000. Nilai yang diterima 1–65525 |
| `HOST` | Alamat bind server; default `0.0.0.0`. Isi `127.0.0.1` untuk akses dari komputer sendiri |

Jika kedua URL diisi, gunakan branch, port, dan database yang sama. Kode memakai schema `inventra` dan menambahkan `sslmode=require` pada URL Neon jika belum ada.

Setelah dependency terpasang dan `.env` diisi, persiapan database dapat dijalankan satu per satu:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
npm start
```

Untuk pemakaian berikutnya, cukup jalankan `npm start`. Gunakan `npm run dev` saat mengembangkan kode agar server dimuat ulang ketika file berubah.

## Cara Menggunakan

1. **Lihat persediaan.** Halaman utama menampilkan daftar barang beserta jumlah jenis barang, total stok, dan nilai persediaan.
2. **Tambah barang.** Klik **Tambah barang**, isi kode, nama, kategori, stok, dan harga satuan, lalu klik **Simpan**.
3. **Cari barang.** Masukkan nama atau kode pada kolom pencarian. Pilih kategori jika ingin mempersempit hasil.
4. **Edit barang.** Klik **Edit** pada baris yang dipilih, ubah datanya, lalu simpan. Kode barang tidak dapat diganti.
5. **Hapus barang.** Klik **Hapus**, periksa nama barang pada dialog, lalu konfirmasi.
6. **Muat ulang.** Gunakan tombol muat ulang jika ingin mengambil data terbaru dari server.

Pencarian dan filter berjalan di browser. Angka ringkasan tetap mencakup seluruh barang, meskipun tabel sedang difilter. Nilai persediaan dihitung dari jumlah `stok × harga` setiap barang.

## Struktur dan Alur Kode

| Lokasi | Isi |
| --- | --- |
| `public/` | Halaman web, CSS, ikon, dan JavaScript untuk berinteraksi dengan API |
| `src/index.js` | Koneksi awal database dan proses menjalankan server |
| `src/app.js` | Konfigurasi Express, file statis, dan endpoint tambahan |
| `src/routes/` | Pemetaan URL dan metode HTTP |
| `src/controllers/` | Penanganan request dan penyusunan respons |
| `src/repositories/` | Operasi baca/tulis barang melalui Prisma |
| `src/middleware/` | Validasi input, log request, dan penanganan kesalahan |
| `src/lib/` | Konfigurasi environment, Prisma Client, dan pesan kesalahan database |
| `prisma/` | Model database, migrasi, dan data contoh |
| `prisma.config.mjs` | Konfigurasi Prisma CLI dan koneksi migrasi |
| `scripts/` | Setup, demo, pemeriksaan konfigurasi, dan pembuat collection Postman |
| `postman/` | Collection untuk mencoba API |
| `tests/` | Tes konfigurasi URL dan integrasi API |
| `IDENTITAS.txt` | Identitas mahasiswa |
| `JALANKAN.cmd` | Skrip untuk menjalankan proyek di Windows |
| `package.json` | Dependency dan perintah npm |
| `package-lock.json` | Versi dependency untuk instalasi dengan `npm ci` |

Request dari frontend diterima router, lalu diteruskan ke controller dan repository. Repository menggunakan Prisma untuk mengakses PostgreSQL. Request POST dan PUT diperiksa middleware validasi sebelum datanya disimpan.

## Database

Data barang disimpan pada tabel `inventra.Barang`. Field `kode` menjadi primary key dan `kategori` memiliki indeks.

| Field | Tipe PostgreSQL | Ketentuan |
| --- | --- | --- |
| `kode` | `VARCHAR(30)` | Unik, 2–30 karakter. Diawali huruf/angka, lalu boleh berisi huruf, angka, atau tanda hubung. Disimpan dalam huruf kapital |
| `nama` | `VARCHAR(80)` | 2–80 karakter setelah spasi di awal/akhir dibuang |
| `kategori` | `VARCHAR(30)` | Alat Tulis, Elektronik, Aksesori, atau Perlengkapan |
| `stok` | `INTEGER` | Bilangan bulat 0–100000; default 0 |
| `harga` | `INTEGER` | Bilangan bulat 0–1000000000 dalam rupiah; default 0 |
| `createdAt` | `TIMESTAMPTZ(3)` | Waktu pembuatan, diisi otomatis |
| `updatedAt` | `TIMESTAMPTZ(3)` | Waktu pembaruan, dikelola Prisma |

### Data Contoh

| Kode | Nama | Kategori | Stok | Harga satuan |
| --- | --- | --- | ---: | ---: |
| ATK-001 | Buku Catatan A5 | Alat Tulis | 42 | Rp25.000 |
| ATK-002 | Pulpen Gel Hitam | Alat Tulis | 64 | Rp8.000 |
| ELK-001 | Lampu Meja LED | Elektronik | 4 | Rp125.000 |
| ELK-002 | Keyboard Wireless | Elektronik | 12 | Rp285.000 |
| AKS-001 | Botol Minum 600 ml | Aksesori | 0 | Rp65.000 |
| PLK-001 | Penyangga Laptop | Perlengkapan | 8 | Rp175.000 |

Pada database baru, seed menghasilkan 6 jenis barang, total stok 130 unit, dan nilai persediaan Rp6.882.000.

Seed melewati kode yang sudah ada sehingga perubahan barang tidak tertimpa. Jika barang bawaan dihapus, menjalankan seed lagi akan menambahkannya kembali.

## REST API

Base URL: `http://localhost:3000`. Sesuaikan dengan port yang tercetak di terminal.

| Metode | Endpoint | Fungsi | Status berhasil |
| --- | --- | --- | ---: |
| GET | `/api/health` | Memeriksa koneksi server dan database | 200 |
| GET | `/api/barang` | Mengambil seluruh barang dan ringkasan | 200 |
| GET | `/api/barang/:kode` | Mengambil satu barang | 200 |
| POST | `/api/barang` | Menambahkan barang | 201 |
| PUT | `/api/barang/:kode` | Memperbarui barang | 200 |
| DELETE | `/api/barang/:kode` | Menghapus barang | 200 |
| GET | `/postman-collection.json` | Mengunduh collection Postman | 200 |

Halaman web tersedia pada `/`. Kode barang pada URL diterima tanpa membedakan huruf besar dan kecil.

### Menambah Barang

Kirim POST ke `/api/barang` dengan header `Content-Type: application/json` dan body:

```json
{
  "kode": "DEMO-001",
  "nama": "Mouse Wireless Demo",
  "kategori": "Elektronik",
  "stok": 10,
  "harga": 85000
}
```

Contoh respons HTTP 201, dengan waktu yang mengikuti server:

```json
{
  "success": true,
  "message": "Barang berhasil ditambahkan.",
  "data": {
    "kode": "DEMO-001",
    "nama": "Mouse Wireless Demo",
    "kategori": "Elektronik",
    "stok": 10,
    "harga": 85000,
    "createdAt": "2026-11-04T10:00:00.000Z",
    "updatedAt": "2026-11-04T10:00:00.000Z"
  }
}
```

Header `Location` pada respons menunjuk ke `/api/barang/DEMO-001`.

### Membaca dan Memperbarui Barang

GET `/api/barang` mengembalikan array barang pada `data` dan ringkasan pada `meta`. Bagian `meta` untuk enam barang seed yang belum diubah:

```json
{
  "totalBarang": 6,
  "totalStok": 130,
  "totalNilai": 6882000,
  "stokMenipis": 2
}
```

`stokMenipis` menghitung barang dengan stok ≤5, termasuk yang stoknya 0. Daftar diurutkan berdasarkan `createdAt`, lalu `kode`, secara menaik.

Untuk mengambil satu barang, gunakan GET `/api/barang/DEMO-001`. Respons berisi objek barang pada `data`.

Untuk mengubahnya, kirim PUT ke URL yang sama dengan header JSON dan body lengkap:

```json
{
  "kode": "DEMO-001",
  "nama": "Mouse Wireless Demo Revisi",
  "kategori": "Elektronik",
  "stok": 15,
  "harga": 95000
}
```

Respons HTTP 200 berisi data terbaru. Kelima field tetap wajib dikirim meskipun hanya stok yang diubah. Kode pada body harus sama dengan kode pada URL.

### Menghapus Barang

Kirim DELETE ke `/api/barang/DEMO-001`. Server mengembalikan HTTP 200 dengan data barang yang dihapus.

GET untuk barang tersebut setelah dihapus menghasilkan HTTP 404:

```json
{
  "success": false,
  "message": "Barang DEMO-001 tidak ditemukan."
}
```

### Memeriksa Koneksi

Buka `/api/health` atau jalankan:

```bash
curl http://localhost:3000/api/health
```

Jika database terhubung, responsnya:

```json
{
  "success": true,
  "message": "Server Inventra aktif.",
  "database": "connected",
  "storage": "PostgreSQL",
  "orm": "Prisma",
  "schema": "inventra"
}
```

### Validasi dan Kesalahan

POST dan PUT menerima satu objek JSON berisi `kode`, `nama`, `kategori`, `stok`, dan `harga`. Kelima field wajib diisi; field tambahan ditolak. Kirim stok dan harga sebagai angka, bukan string. Batas body JSON adalah `32kb`.

Contoh HTTP 400 jika stok bernilai negatif dan field lain valid:

```json
{
  "success": false,
  "message": "Data barang belum valid.",
  "errors": {
    "stok": "Stok harus angka bulat 0–100000."
  }
}
```

| Status | Penyebab |
| --- | --- |
| 400 | Input tidak valid, body tidak lengkap, atau JSON rusak |
| 404 | Barang atau endpoint tidak ditemukan |
| 409 | Kode barang sudah digunakan |
| 413 | Body request melebihi batas |
| 415 | POST/PUT tidak menggunakan `application/json` |
| 500 | Kesalahan server yang tidak ditangani secara khusus |
| 503 | Gangguan koneksi database yang dikenali error handler |

## Mencoba API dengan Postman

Jalankan aplikasi, lalu impor [Inventra.postman_collection.json](postman/Inventra.postman_collection.json). Server memperbarui collection sesuai port yang digunakan. Collection juga bisa diunduh dari `/postman-collection.json`.

Jalankan request sesuai urutan:

| Urutan | Request | Status yang diharapkan |
| --- | --- | ---: |
| 01 | GET seluruh barang | 200 |
| 02 | POST barang DEMO-001 | 201 |
| 03 | GET detail DEMO-001 | 200 |
| 04 | PUT DEMO-001 | 200 |
| 05 | GET hasil perubahan | 200 |
| 06 | DELETE DEMO-001 | 200 |
| 07 | GET setelah dihapus | 404 |

Collection sudah menyertakan body dan pemeriksaan status HTTP. Jika POST menghasilkan 409, hapus DEMO-001 yang masih tersimpan melalui request 06 sebelum mengulangi alur.

## Perintah npm

| Perintah | Kegunaan |
| --- | --- |
| `npm ci` | Memasang dependency sesuai lockfile |
| `npm run demo` | Setup, generate Prisma Client, migrasi, seed, dan menjalankan aplikasi |
| `npm start` | Menjalankan aplikasi setelah persiapan selesai |
| `npm run dev` | Menjalankan server dengan pemantauan perubahan file |
| `npm run setup` | Mengisi koneksi secara interaktif jika belum tersedia |
| `npm run check:env` | Memeriksa format URL database |
| `npm run db:generate` | Membuat Prisma Client |
| `npm run db:deploy` | Menerapkan migrasi yang tersedia |
| `npm run db:migrate` | Mengembangkan migrasi dengan `prisma migrate dev` |
| `npm run db:seed` | Menambahkan data contoh |
| `npm run db:studio` | Membuka Prisma Studio |
| `npm test` | Menjalankan tes otomatis |

`npm start` dan `npm run dev` tidak menjalankan migrasi atau seed. Pemeriksaan `check:env` hanya memvalidasi format koneksi; server mencoba koneksi database saat mulai berjalan.

## Pengujian Otomatis

Setelah dependency terpasang, jalankan:

```bash
npm test
```

`tests/env.test.js` memeriksa normalisasi dan validasi URL. `tests/api.test.js` memeriksa CRUD, validasi input, kode duplikat, ringkasan, persistensi data, seed ulang, dan collection Postman.

Tes integrasi dilewati jika `TEST_DATABASE_URL` tidak tersedia. Untuk menjalankannya, siapkan database terpisah dengan nama berakhiran `_test` dan buat Prisma Client dengan `npm run db:generate`.

Tes mengosongkan tabel `inventra.Barang` pada database uji, mengisi data contoh, dan membuat `public.LegacyChallenge` untuk memeriksa pemisahan schema. Gunakan database khusus pengujian.

**PowerShell:**

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@HOST/inventra_test?sslmode=require"
npm test
Remove-Item Env:TEST_DATABASE_URL
```

**Bash:**

```bash
TEST_DATABASE_URL='postgresql://USER:PASSWORD@HOST/inventra_test?sslmode=require' npm test
```

Ganti URL contoh dengan URL direct database uji. Berikan `TEST_DATABASE_URL` melalui environment terminal agar tes integrasi dijalankan.

## Kendala yang Sering Muncul

| Kendala | Langkah |
| --- | --- |
| Node.js tidak ditemukan atau versinya tidak sesuai | Pasang versi yang memenuhi rentang di `package.json`, lalu buka terminal baru |
| `DATABASE_URL belum diisi` | Jalankan `npm run setup` atau lengkapi `.env` |
| Login database gagal | Salin ulang connection string dan periksa kredensial |
| Database tidak terjangkau | Periksa koneksi internet, hostname, port, dan database |
| Tabel belum tersedia | Jalankan `npm run db:deploy` |
| Prisma Client belum dibuat | Jalankan `npm run db:generate` |
| Port 3000 tidak terbuka | Pakai alamat Website yang tercetak di terminal |
| Semua percobaan port gagal | Hentikan server lama atau ubah `PORT` di `.env` |
| PUT ditolak | Kirim kelima field dan samakan kode body dengan kode URL |

