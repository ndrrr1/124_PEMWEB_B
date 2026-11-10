@echo off
setlocal
cd /d "%~dp0"
title Inventra - Express Prisma Neon
where node >nul 2>nul
if errorlevel 1 (
  echo Pasang Node.js 24 LTS, lalu coba lagi.
  pause
  exit /b 1
)
node scripts/check-runtime.js
if errorlevel 1 (
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm tidak ditemukan. Pasang ulang Node.js lalu buka terminal baru.
  pause
  exit /b 1
)
if not exist "node_modules\prisma\build\index.js" (
  echo Memasang dependency. Tunggu sampai selesai...
  call npm ci
  if errorlevel 1 (
    echo Instalasi gagal. Periksa koneksi internet lalu coba lagi.
    pause
    exit /b 1
  )
)
echo Menyiapkan database dan menjalankan Inventra...
echo Biarkan jendela ini terbuka selama memakai aplikasi.
call npm run demo
if errorlevel 1 echo Baca pesan kesalahan di atas, perbaiki, lalu jalankan lagi.
pause
