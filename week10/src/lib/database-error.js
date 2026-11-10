export function databaseErrorMessage(error) {
  const code = error.code || error.cause?.code;
  if (["P1000", "28P01"].includes(code)) return "Login database gagal. Salin ulang URL dari Neon > Connect dan simpan di .env.";
  if (["P1001", "P1002", "P1017", "ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(code)) return "Database belum terjangkau. Periksa internet dan connection string Neon, lalu ulangi.";
  if (["P2021", "P2022"].includes(code)) return "Tabel database belum siap. Jalankan npm run demo untuk menerapkan migrasi.";
  return String(error.message || "Terjadi kesalahan.").replace(/postgres(?:ql)?:\/\/[^\s'"`]+/gi, "[connection string]");
}
