export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function errorHandler(error, _req, res, _next) {
  if (error.code === "P2002") {
    return res.status(409).json({ success: false, message: "Kode barang sudah digunakan." });
  }
  if (error.code === "P2025") {
    return res.status(404).json({ success: false, message: "Barang tidak ditemukan." });
  }
  if (["P1001", "P1002", "P1017", "P2024", "P2037", "ECONNREFUSED", "ETIMEDOUT"].includes(error.code)) {
    return res.status(503).json({ success: false, message: "Database belum terhubung. Coba lagi sebentar." });
  }
  if (error.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({
        success: false,
        message: "Body JSON tidak valid. Periksa tanda kutip dan koma.",
      });
  }
  if (error.type === "entity.too.large") {
    return res
      .status(413)
      .json({
        success: false,
        message: "Body request terlalu besar. Maksimal 32 KB.",
      });
  }
  const status = error instanceof HttpError ? error.status : 500;
  if (status === 500) console.error("[server]", error);
  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Server gagal memproses data. Periksa terminal server."
        : error.message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
}
