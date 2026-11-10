**Nama:** ISI_NAMA_LENGKAP  
**NRP:** ISI_NRP  
**Kelas:** ISI_KELAS

# Inventra — Aplikasi Inventaris Barang

Inventra adalah aplikasi web untuk mengelola inventaris barang menggunakan **Express**, **Prisma ORM**, dan **PostgreSQL**. Pengguna dapat menambah, melihat, mengubah, serta menghapus barang melalui antarmuka web maupun REST API.

Frontend dibuat dengan HTML, CSS, dan JavaScript tanpa framework. Backend dan frontend dilayani oleh satu server Express. Konfigurasi koneksi bawaan disiapkan untuk PostgreSQL di Neon, dengan penyimpanan data pada schema `inventra`.

Dokumentasi ini disusun berdasarkan kode dalam folder `week10`. Isi identitas di bagian paling atas sebelum mengunggah proyek ke GitHub.

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Persyaratan](#persyaratan)
- [Cara Menjalankan](#cara-menjalankan)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Struktur Proyek](#struktur-proyek)
- [Alur Aplikasi](#alur-aplikasi)
- [Database dan Data Contoh](#database-dan-data-contoh)
- [Dokumentasi API](#dokumentasi-api)
- [Pengujian dengan Postman](#pengujian-dengan-postman)
- [Perintah npm](#perintah-npm)
- [Pengujian Otomatis](#pengujian-otomatis)
- [Mengunggah ke GitHub](#mengunggah-ke-github)
- [Pemecahan Masalah](#pemecahan-masalah)
- [Batasan Implementasi](#batasan-implementasi)

## Fitur

- CRUD barang: tambah, daftar, detail melalui API, edit, dan hapus.
- Pencarian barang berdasarkan nama atau kode pada antarmuka web.
- Filter berdasarkan kategori: Alat Tulis, Elektronik, Aksesori, dan Perlengkapan.
- Ringkasan jumlah jenis barang, total stok, dan nilai persediaan.
- Penanda stok **Menipis** untuk stok 1–5 dan **Habis** untuk stok 0.
- Form tambah/edit, konfirmasi penghapusan, serta notifikasi hasil operasi.
- Validasi JSON, pemeriksaan kode unik, dan respons kesalahan terstruktur.
- Penyimpanan PostgreSQL, migrasi database, dan seed data contoh.
- Endpoint pemeriksaan koneksi database serta collection Postman.
- Tampilan yang menyesuaikan ukuran layar dan format mata uang rupiah.

Pencarian dan filter bekerja di browser terhadap daftar barang yang sudah dimuat. Ringkasan persediaan tetap dihitung dari seluruh data barang.

## Teknologi

Versi berikut mengikuti `package.json` di dalam proyek.

| Komponen | Teknologi/versi | Kegunaan |
| --- | --- | --- |
| Runtime | Node.js; disarankan 24.x sesuai petunjuk bawaan proyek | Menjalankan server dan skrip |
| Backend | Express 5.1.0 | Routing, middleware, REST API, dan file statis |
| ORM | Prisma dan Prisma Client 7.10.1 | Akses data, migrasi, dan seed |
| Adapter database | `@prisma/adapter-pg` 7.10.1 | Menghubungkan Prisma dengan PostgreSQL |
| Driver database | `pg` 8.22.0 | Koneksi PostgreSQL |
| Environment | `dotenv` 17.2.3 | Memuat konfigurasi dari `.env` |
| Database | PostgreSQL; konfigurasi bawaan untuk Neon | Penyimpanan data |
| Frontend | HTML, CSS, dan JavaScript ES Modules | Antarmuka pengguna |
| Pengujian | `node:test`, `node:assert/strict`, dan Postman | Pengujian konfigurasi dan API |

Rentang Node.js dalam `package.json` adalah `^22.12.0 || ^24.0.0 || >=26.0.0`. Gunakan versi yang memenuhi rentang tersebut.

## Persyaratan

1. Node.js dan npm tersedia di komputer.
2. PostgreSQL tersedia; panduan bawaan menggunakan project/database Neon.
3. Connection string database beserta akses untuk membuat schema, tabel, dan menjalankan migrasi.
4. Koneksi internet untuk instalasi dependency dan akses database Neon.
5. Browser untuk membuka aplikasi.
6. Postman bersifat opsional untuk mencoba API.

## Cara Menjalankan

### Opsi 1: Terminal

Ekstrak ZIP atau clone repositori, kemudian buka terminal pada folder yang berisi `package.json`. Jika terminal masih berada di folder induk, masuk ke folder proyek:

```bash
cd week10
```

Periksa runtime dan pasang dependency berdasarkan `package-lock.json`:

```bash
node --version
npm --version
npm ci
```

Jalankan persiapan dan aplikasi:

```bash
npm run demo
```

Jika `DATABASE_URL` belum terisi, skrip meminta connection string secara interaktif. Salin URL PostgreSQL dengan pooling aktif dari menu **Connect** di project Neon, lalu tempelkan ke terminal.

Perintah `npm run demo` menjalankan langkah berikut secara berurutan:

1. Memeriksa konfigurasi; meminta dan menyimpan URL ke `.env` jika diperlukan.
2. Membuat Prisma Client.
3. Menerapkan migrasi yang tersedia menggunakan `prisma migrate deploy`.
4. Menambahkan data contoh dengan melewati kode barang yang sudah ada.
5. Menjalankan server Express.

Setelah muncul pesan **INVENTRA SIAP**, buka alamat **Website** yang tercetak di terminal. Alamat bawaan:

[http://localhost:3000](http://localhost:3000)

Jika port tersebut digunakan, server mencoba hingga sembilan port berikutnya. Gunakan alamat yang benar-benar tercetak di terminal.

Biarkan terminal tetap terbuka selama aplikasi digunakan. Hentikan server dengan `Ctrl+C`.

### Opsi 2: Windows

1. Pastikan Node.js dan npm sudah terpasang.
2. Ekstrak proyek ke suatu folder.
3. Klik dua kali `JALANKAN.cmd`.
4. Ikuti permintaan connection string jika konfigurasi belum tersedia.
5. Buka alamat Website yang tercetak.

`JALANKAN.cmd` memeriksa runtime, memasang dependency jika instalasi Prisma belum ditemukan, lalu menjalankan `npm run demo`.

### Opsi 3: Persiapan manual

Salin template konfigurasi.

**macOS/Linux:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Isi `DATABASE_URL` di `.env`, kemudian jalankan:

```bash
npm ci
npm run check:env
npm run db:generate
npm run db:deploy
npm run db:seed
npm start
```

Setelah database dan Prisma Client siap, penggunaan berikutnya cukup dengan `npm start`. Untuk pengembangan dengan pemantauan perubahan kode:

```bash
npm run dev
```

`npm start` dan `npm run dev` tidak menerapkan migrasi atau menjalankan seed secara otomatis.

## Konfigurasi Environment

Contoh isi `.env` berikut harus dilengkapi dengan connection string asli:

```dotenv
DATABASE_URL="TEMPEL_CONNECTION_STRING_NEON"
DATABASE_URL_UNPOOLED=""
PORT=3000
```

| Variabel | Status | Penjelasan |
| --- | --- | --- |
| `DATABASE_URL` | Wajib | URL PostgreSQL untuk koneksi aplikasi; Neon dapat menggunakan URL pooled |
| `DATABASE_URL_UNPOOLED` | Opsional | URL direct untuk migrasi; jika kosong, kode menurunkannya dari URL Neon dengan menghapus `-pooler` pada hostname |
| `PORT` | Opsional | Port awal server; bawaan `3000`, nilai awal yang diterima 1–65525 |
| `HOST` | Opsional | Alamat bind server; bawaan `0.0.0.0`. Gunakan `127.0.0.1` bila akses hanya diperlukan dari komputer yang sama |

Catatan konfigurasi:

- `DATABASE_URL` dan `DATABASE_URL_UNPOOLED`, jika keduanya diisi, harus mengarah ke branch/host dasar, port, dan database yang sama.
- Kode menambahkan parameter `schema=inventra` pada URL.
- Untuk hostname Neon, `sslmode=require` ditambahkan jika parameter tersebut belum tersedia.
- `npm run setup` dapat digunakan untuk mengisi konfigurasi secara interaktif ketika `DATABASE_URL` belum tersedia.
- Pesan **Format koneksi database siap** hanya menyatakan format URL valid. Koneksi database benar-benar dicoba ketika server dijalankan.
- Simpan kredensial pada `.env`; template `.env.example` tetap menggunakan nilai kosong.

## Struktur Proyek

| Lokasi | Fungsi |
| --- | --- |
| `public/index.html` | Halaman utama, tabel barang, form, dan dialog hapus |
| `public/styles.css` | Gaya visual dan tata letak responsif |
| `public/app.js` | Interaksi pengguna, render data, pencarian, filter, dan CRUD |
| `public/api.js` | Helper Fetch API, format angka, rupiah, dan pesan kesalahan |
| `public/icons.svg`, `public/favicon.svg` | Aset ikon aplikasi |
| `src/index.js` | Koneksi awal database, pemilihan port, dan proses server |
| `src/app.js` | Konfigurasi Express, endpoint health, router API, dan file statis |
| `src/routes/barang.routes.js` | Definisi endpoint CRUD barang |
| `src/controllers/barang.controller.js` | Penanganan request dan penyusunan respons |
| `src/repositories/barang.repository.js` | Operasi data menggunakan Prisma |
| `src/middleware/validate-barang.js` | Validasi body barang |
| `src/middleware/errors.js` | Penanganan kesalahan HTTP dan database |
| `src/middleware/request-logger.js` | Pencatatan request API di terminal |
| `src/lib/env.js` | Pembacaan dan normalisasi konfigurasi database |
| `src/lib/prisma.js` | Pembuatan Prisma Client dan adapter PostgreSQL |
| `src/lib/database-error.js` | Pesan kesalahan koneksi database |
| `prisma/schema.prisma` | Definisi model `Barang` |
| `prisma/migrations/` | Migrasi schema, tabel, indeks, dan constraint |
| `prisma/seed.js`, `prisma/seed-data.js` | Proses dan isi data contoh |
| `prisma.config.mjs` | Konfigurasi Prisma CLI dan koneksi migrasi |
| `scripts/` | Skrip setup, demo, pemeriksaan environment/runtime, dan pembuat collection |
| `postman/Inventra.postman_collection.json` | Collection pengujian API |
| `tests/env.test.js` | Pengujian konfigurasi URL |
| `tests/api.test.js` | Pengujian integrasi Express dan PostgreSQL |
| `IDENTITAS.txt` | Form identitas bawaan; lengkapi juga sebelum pengumpulan |
| `JALANKAN.cmd` | Launcher Windows |
| `MULAI-DARI-SINI.txt` | Petunjuk singkat menjalankan proyek |
| `package.json`, `package-lock.json` | Dependency, skrip npm, dan versi instalasi |
| `.env.example` | Template konfigurasi tanpa kredensial |
| `.gitignore` | Pengecualian file lokal dari Git |
| `README.md` | Dokumentasi proyek |

## Alur Aplikasi

1. Browser memuat halaman dan aset dari folder `public/` melalui Express.
2. JavaScript frontend mengirim request ke `/api/barang`.
3. Router memilih controller sesuai metode HTTP dan URL. Request POST/PUT melewati validasi body.
4. Controller memanggil repository untuk melakukan operasi melalui Prisma dan adapter PostgreSQL.
5. PostgreSQL menyimpan atau membaca record pada `inventra.Barang`.
6. Server mengembalikan JSON; frontend memperbarui tabel, ringkasan, dan notifikasi.

## Database dan Data Contoh

### Model Barang

Schema database: `inventra`  
Tabel: `Barang`  
Primary key: `kode`

| Field | Tipe database | Keterangan |
| --- | --- | --- |
| `kode` | `VARCHAR(30)` | Kode unik barang dan primary key |
| `nama` | `VARCHAR(80)` | Nama barang |
| `kategori` | `VARCHAR(30)` | Salah satu dari empat kategori yang tersedia |
| `stok` | `INTEGER` | Stok; default 0 |
| `harga` | `INTEGER` | Harga satuan dalam rupiah; default 0 |
| `createdAt` | `TIMESTAMPTZ(3)` | Waktu pembuatan; otomatis |
| `updatedAt` | `TIMESTAMPTZ(3)` | Waktu pembaruan; dikelola Prisma |

Migrasi menambahkan indeks pada `kategori`, constraint primary key, serta pemeriksaan batas stok, harga, dan pilihan kategori.

### Seed Data

| Kode | Nama barang | Kategori | Stok | Harga satuan |
| --- | --- | --- | ---: | ---: |
| ATK-001 | Buku Catatan A5 | Alat Tulis | 42 | Rp25.000 |
| ATK-002 | Pulpen Gel Hitam | Alat Tulis | 64 | Rp8.000 |
| ELK-001 | Lampu Meja LED | Elektronik | 4 | Rp125.000 |
| ELK-002 | Keyboard Wireless | Elektronik | 12 | Rp285.000 |
| AKS-001 | Botol Minum 600 ml | Aksesori | 0 | Rp65.000 |
| PLK-001 | Penyangga Laptop | Perlengkapan | 8 | Rp175.000 |

Jika hanya enam record seed tersebut yang tersimpan dan belum diubah:

| Ringkasan | Nilai |
| --- | ---: |
| Jumlah jenis barang | 6 |
| Total stok | 130 unit |
| Nilai persediaan | Rp6.882.000 |
| Jumlah barang dengan stok ≤5 | 2 |

Nilai persediaan dihitung dengan menjumlahkan `stok × harga` untuk setiap barang.

Seed menggunakan `createMany({ skipDuplicates: true })`. Menjalankan seed kembali melewati kode yang sudah ada dan tidak menimpa perubahan pada record tersebut. Record seed yang sudah dihapus akan ditambahkan kembali ketika seed dijalankan.

## Dokumentasi API

Base URL bawaan: `http://localhost:3000`. Sesuaikan port jika server menggunakan alamat lain.

Untuk POST dan PUT, kirim header:

```http
Content-Type: application/json
```

### Daftar Endpoint

| Metode | Endpoint | Fungsi | Status berhasil |
| --- | --- | --- | ---: |
| GET | `/` | Membuka antarmuka web | 200 |
| GET | `/api/health` | Memeriksa server dan koneksi database | 200 |
| GET | `/api/barang` | Menampilkan seluruh barang dan ringkasan | 200 |
| GET | `/api/barang/:kode` | Menampilkan detail barang | 200 |
| POST | `/api/barang` | Menambahkan barang | 201 |
| PUT | `/api/barang/:kode` | Memperbarui barang dengan body lengkap | 200 |
| DELETE | `/api/barang/:kode` | Menghapus barang | 200 |
| GET | `/postman-collection.json` | Mengunduh collection Postman | 200 |

### Validasi Data Barang

Seluruh field berikut wajib dikirim pada POST dan PUT.

| Field | Tipe JSON | Aturan |
| --- | --- | --- |
| `kode` | string | 2–30 karakter; karakter pertama huruf/angka, berikutnya huruf/angka/tanda hubung; dinormalisasi menjadi huruf kapital |
| `nama` | string | 2–80 karakter setelah spasi awal/akhir dihapus |
| `kategori` | string | Tepat salah satu: `Alat Tulis`, `Elektronik`, `Aksesori`, `Perlengkapan` |
| `stok` | number | Bilangan bulat 0–100000 |
| `harga` | number | Bilangan bulat 0–1000000000; satuan rupiah |

- Field tambahan di luar lima field tersebut ditolak.
- `stok` dan `harga` harus dikirim sebagai angka JSON, bukan string.
- Body harus berupa satu objek JSON; array tidak diterima.
- Pada PUT, `kode` dalam body harus sama dengan kode pada URL setelah normalisasi kapital.
- Kode barang tidak dapat diganti melalui PUT; form edit membuat kolom kode hanya-baca.
- Batas body JSON yang dikonfigurasi adalah `32kb`.

### 1. Memeriksa Koneksi

```bash
curl http://localhost:3000/api/health
```

Contoh respons ketika database terhubung:

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

### 2. Menampilkan Semua Barang

```bash
curl http://localhost:3000/api/barang
```

Respons berisi `success`, `message`, array `data`, dan objek `meta`.

| Field pada meta | Arti |
| --- | --- |
| `totalBarang` | Jumlah record barang |
| `totalStok` | Jumlah seluruh stok |
| `totalNilai` | Jumlah seluruh `stok × harga` |
| `stokMenipis` | Jumlah barang dengan stok ≤5, termasuk stok 0 |

Urutan hasil mengikuti `createdAt` menaik, kemudian `kode` menaik. Endpoint ini belum menyediakan parameter pencarian, filter, atau pagination di server.

### 3. Menambah Barang

```bash
curl -X POST http://localhost:3000/api/barang -H 'Content-Type: application/json' -d '{"kode":"DEMO-001","nama":"Mouse Wireless Demo","kategori":"Elektronik","stok":10,"harga":85000}'
```

Contoh respons HTTP `201 Created`; nilai waktu mengikuti server:

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

Respons juga menyertakan header `Location: /api/barang/DEMO-001`.

### 4. Melihat Detail Barang

```bash
curl http://localhost:3000/api/barang/DEMO-001
```

Respons HTTP `200` menggunakan `success: true`, pesan **Detail barang berhasil dimuat.**, dan objek barang pada `data`. Kode pada URL diterima tanpa membedakan huruf besar/kecil.

### 5. Memperbarui Barang

```bash
curl -X PUT http://localhost:3000/api/barang/DEMO-001 -H 'Content-Type: application/json' -d '{"kode":"DEMO-001","nama":"Mouse Wireless Demo Revisi","kategori":"Elektronik","stok":15,"harga":95000}'
```

Respons HTTP `200` berisi pesan **Barang berhasil diperbarui.** dan record terbaru pada `data`. Kirim kelima field barang meskipun hanya satu nilai yang diubah.

### 6. Menghapus Barang

```bash
curl -X DELETE http://localhost:3000/api/barang/DEMO-001
```

Respons HTTP `200` berisi pesan **Barang berhasil dihapus.** dan record yang dihapus pada `data`.

Jika detail barang yang sama diminta kembali, server mengembalikan HTTP `404`.

Contoh perintah curl di atas memakai sintaks shell Bash. Pada Windows, gunakan Git Bash, WSL, atau impor collection Postman.

### Format Kesalahan

Contoh respons validasi HTTP `400` ketika nilai stok berada di luar batas:

```json
{
  "success": false,
  "message": "Data barang belum valid.",
  "errors": {
    "stok": "Stok harus angka bulat 0–100000."
  }
}
```

| Status HTTP | Kondisi |
| --- | --- |
| 400 Bad Request | Validasi gagal, kode PUT berbeda, body tidak lengkap, atau JSON rusak |
| 404 Not Found | Barang atau endpoint tidak ditemukan |
| 409 Conflict | Kode barang sudah digunakan |
| 413 Payload Too Large | Body request melampaui batas |
| 415 Unsupported Media Type | POST/PUT tidak menggunakan `application/json` |
| 500 Internal Server Error | Kesalahan server yang tidak ditangani secara khusus |
| 503 Service Unavailable | Gangguan koneksi database tertentu yang dikenali error handler |

## Pengujian dengan Postman

1. Jalankan aplikasi hingga muncul **INVENTRA SIAP**.
2. Impor [Inventra.postman_collection.json](postman/Inventra.postman_collection.json) ke Postman. File ini diperbarui oleh server sesuai port yang dipakai.
3. Jika file tidak dapat diperbarui, unduh collection dari endpoint `/postman-collection.json` pada alamat server yang aktif.
4. Jalankan request secara berurutan.

| Urutan | Request | Status yang diharapkan |
| --- | --- | ---: |
| 01 | GET seluruh barang | 200 |
| 02 | POST tambah DEMO-001 | 201 |
| 03 | GET detail hasil POST | 200 |
| 04 | PUT edit DEMO-001 | 200 |
| 05 | GET detail hasil PUT | 200 |
| 06 | DELETE DEMO-001 | 200 |
| 07 | GET sesudah DELETE | 404 |

Setiap request dalam collection memiliki pemeriksaan status HTTP. Status `404` pada request 07 merupakan hasil yang diharapkan karena barang sudah dihapus.

Jika request POST menghasilkan `409`, kode `DEMO-001` masih tersimpan. Hapus barang demo tersebut melalui antarmuka atau request 06 sebelum mengulangi alur.

## Perintah npm

Jalankan perintah dari direktori yang berisi `package.json`.

| Perintah | Fungsi |
| --- | --- |
| `npm ci` | Memasang dependency sesuai lockfile |
| `npm run setup` | Memeriksa konfigurasi atau meminta URL database secara interaktif |
| `npm run demo` | Setup, generate Prisma Client, deploy migrasi, seed, lalu menjalankan server |
| `npm start` | Memeriksa konfigurasi dan menjalankan server |
| `npm run dev` | Memeriksa konfigurasi dan menjalankan server dengan `node --watch` |
| `npm run check:env` | Memeriksa format konfigurasi URL database |
| `npm run db:generate` | Membuat Prisma Client |
| `npm run db:migrate` | Menjalankan `prisma migrate dev` untuk pengembangan migrasi |
| `npm run db:deploy` | Menerapkan migrasi yang sudah tersedia |
| `npm run db:seed` | Menambahkan data contoh tanpa menimpa kode yang sudah ada |
| `npm run db:studio` | Membuka Prisma Studio |
| `npm test` | Menjalankan pengujian dengan Node.js Test Runner |

Untuk persiapan awal dari ZIP, gunakan `npm run demo` atau urutan manual yang memakai `db:deploy`. `db:migrate` digunakan ketika mengembangkan perubahan model database.

## Pengujian Otomatis

Proyek menyediakan pengujian konfigurasi dan pengujian integrasi.

### Pengujian tanpa Database Uji

Setelah dependency terpasang:

```bash
npm test
```

Jika `TEST_DATABASE_URL` tidak diberikan pada environment proses, pengujian integrasi akan berstatus **skip**. Pengujian konfigurasi URL tetap dijalankan. Hasil ini tidak membuktikan bahwa operasi CRUD ke database telah lulus.

### Pengujian Integrasi PostgreSQL

Gunakan database khusus pengujian yang namanya berakhiran `_test`, misalnya `inventra_test`. Pengujian menghapus seluruh isi tabel `inventra.Barang` pada database tersebut, mengisi seed, dan membuat tabel `public.LegacyChallenge` untuk memeriksa pemisahan schema.

Pastikan Prisma Client sudah dibuat:

```bash
npm run db:generate
```

Berikan URL **direct** database uji melalui environment terminal. Ganti nilai contoh dengan kredensial database uji milik sendiri.

**macOS/Linux atau Git Bash:**

```bash
TEST_DATABASE_URL='postgresql://USER:PASSWORD@HOST/inventra_test?sslmode=require' npm test
```

**Windows PowerShell:**

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@HOST/inventra_test?sslmode=require"
npm test
Remove-Item Env:TEST_DATABASE_URL
```

Gunakan environment terminal untuk variabel uji tersebut. File tes memutuskan apakah integrasi dijalankan berdasarkan `process.env.TEST_DATABASE_URL`.

Pengujian integrasi mencakup:

- Daftar barang, perhitungan ringkasan, dan endpoint health.
- Penyimpanan POST ke PostgreSQL, PUT, DELETE, dan pembacaan detail.
- Penolakan kode duplikat serta normalisasi huruf kapital.
- Validasi field, body tidak lengkap, JSON rusak, dan Content-Type.
- Kode unik saat dua request dikirim bersamaan.
- Persistensi data setelah server dan Prisma Client dibuat ulang.
- Seed ulang tanpa menimpa perubahan.
- Pemisahan data aplikasi dari schema `public`.
- Penolakan akses web ke file konfigurasi dan kode server.
- Kelengkapan URL serta body pada collection Postman.

## Mengunggah ke GitHub

1. Isi Nama, NRP, dan Kelas pada bagian paling atas README.
2. Lengkapi juga `IDENTITAS.txt`.
3. Letakkan `README.md` sejajar dengan `package.json`.
4. Sertakan source code, aset frontend, `prisma/`, `scripts/`, `tests/`, collection Postman, `package.json`, `package-lock.json`, dan `.env.example`.
5. Pastikan `.env` dan `node_modules/` tidak ikut dilacak Git.

Proyek sudah menyediakan `.gitignore` yang mengabaikan `node_modules/`, `dist/`, file log, `.env`, dan varian `.env.*`, dengan pengecualian `.env.example`.

Untuk repositori GitHub baru yang masih kosong, jalankan dari root proyek. Ganti `USERNAME` dan `NAMA_REPOSITORY` dengan tujuan yang benar:

```bash
git init
git add .
git status
git commit -m "Tambahkan proyek Inventra dan dokumentasi"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA_REPOSITORY.git
git push -u origin main
```

Periksa daftar file pada `git status` sebelum commit. Pengguna lain memasang dependency melalui `npm ci` dan mengisi koneksi database mereka sendiri.

## Pemecahan Masalah

| Masalah | Langkah penyelesaian |
| --- | --- |
| `node` atau `npm` tidak ditemukan | Pasang Node.js beserta npm, lalu buka terminal baru |
| Versi Node.js tidak sesuai | Gunakan Node.js yang memenuhi rentang pada bagian Teknologi |
| `DATABASE_URL belum diisi` | Jalankan `npm run setup` atau isi URL asli pada `.env` |
| Connection string masih contoh/tidak valid | Salin URL lengkap dari Neon; pastikan memuat user, password, host, dan nama database |
| URL pooled dan direct tidak cocok | Gunakan koneksi dari branch dan database yang sama; kosongkan `DATABASE_URL_UNPOOLED` agar URL direct Neon diturunkan otomatis bila sesuai |
| Login database gagal | Periksa kembali kredensial di connection string |
| Database belum terjangkau | Periksa koneksi internet, hostname, port, dan ketersediaan database |
| Tabel database belum siap | Jalankan `npm run db:deploy` atau ulangi `npm run demo` |
| Prisma Client belum tersedia | Jalankan `npm run db:generate` |
| Halaman tidak terbuka pada port 3000 | Gunakan alamat Website yang tercetak di terminal karena server dapat berpindah port |
| Sepuluh port berurutan sedang dipakai | Hentikan proses server lama atau ubah `PORT` di `.env` |
| POST menghasilkan 409 | Gunakan kode baru atau hapus barang demo yang masih ada |
| PUT menghasilkan 400 | Kirim seluruh field wajib dan samakan kode body dengan kode URL |
| Integrasi berstatus skip | Isi `TEST_DATABASE_URL` melalui environment terminal sebelum menjalankan tes |

## Batasan Implementasi

- Belum tersedia login, autentikasi API, atau pembagian hak akses.
- Pencarian dan filter dilakukan di frontend; API belum menyediakan pagination.
- Perubahan stok dilakukan melalui edit barang; belum tersedia riwayat transaksi stok masuk/keluar.
- Data tersimpan di PostgreSQL sehingga aplikasi memerlukan database aktif.
- Repository dalam arsip belum menyertakan file `LICENSE`.

