export function createBarangController(repository) {
  return {
    async list(_req, res) {
      const data = await repository.all();
      res.status(200).json({
        success: true,
        message: "Daftar barang berhasil dimuat.",
        data,
        meta: {
          totalBarang: data.length,
          totalStok: data.reduce((total, row) => total + row.stok, 0),
          totalNilai: data.reduce(
            (total, row) => total + row.stok * row.harga,
            0,
          ),
          stokMenipis: data.filter((row) => row.stok <= 5).length,
        },
      });
    },
    async detail(req, res) {
      res
        .status(200)
        .json({
          success: true,
          message: "Detail barang berhasil dimuat.",
          data: await repository.get(req.params.kode),
        });
    },
    async create(_req, res) {
      const data = await repository.create(res.locals.barang);
      res
        .location(`/api/barang/${encodeURIComponent(data.kode)}`)
        .status(201)
        .json({ success: true, message: "Barang berhasil ditambahkan.", data });
    },
    async update(req, res) {
      const data = await repository.update(req.params.kode, res.locals.barang);
      res
        .status(200)
        .json({ success: true, message: "Barang berhasil diperbarui.", data });
    },
    async delete(req, res) {
      const data = await repository.delete(req.params.kode);
      res
        .status(200)
        .json({ success: true, message: "Barang berhasil dihapus.", data });
    },
  };
}
