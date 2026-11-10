import { HttpError } from "./errors.js";

export const KATEGORI = [
  "Alat Tulis",
  "Elektronik",
  "Aksesori",
  "Perlengkapan",
];

export function validateBarang(req, res, next) {
  if (!req.is("application/json")) {
    return next(
      new HttpError(415, "Gunakan header Content-Type: application/json."),
    );
  }
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return next(new HttpError(400, "Body harus berupa satu objek JSON."));
  }
  const errors = {};
  const kode =
    typeof body.kode === "string" ? body.kode.trim().toUpperCase() : "";
  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  const kategori =
    typeof body.kategori === "string" ? body.kategori.trim() : "";
  if (!/^[A-Z0-9][A-Z0-9-]{1,29}$/.test(kode))
    errors.kode =
      "Kode 2–30 karakter, gunakan huruf, angka, atau tanda hubung.";
  if (nama.length < 2 || nama.length > 80)
    errors.nama = "Nama barang harus 2–80 karakter.";
  if (!KATEGORI.includes(kategori))
    errors.kategori =
      "Pilih Alat Tulis, Elektronik, Aksesori, atau Perlengkapan.";
  if (!Number.isInteger(body.stok) || body.stok < 0 || body.stok > 100000)
    errors.stok = "Stok harus angka bulat 0–100000.";
  if (
    !Number.isInteger(body.harga) ||
    body.harga < 0 ||
    body.harga > 1000000000
  )
    errors.harga = "Harga harus angka bulat 0–1000000000 rupiah.";
  const unknown = Object.keys(body).filter(
    (key) => !["kode", "nama", "kategori", "stok", "harga"].includes(key),
  );
  if (unknown.length)
    errors.body = `Field tidak dikenal: ${unknown.join(", ")}.`;
  if (req.params.kode && kode !== req.params.kode.toUpperCase())
    errors.kode = "Kode pada body harus sama dengan kode pada URL.";
  if (Object.keys(errors).length)
    return next(new HttpError(400, "Data barang belum valid.", errors));
  res.locals.barang = {
    kode,
    nama,
    kategori,
    stok: body.stok,
    harga: body.harga,
  };
  next();
}
