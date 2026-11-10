import { HttpError } from "../middleware/errors.js";

export class BarangRepository {
  constructor(prisma) { this.prisma = prisma; }

  all() {
    return this.prisma.barang.findMany({ orderBy: [{ createdAt: "asc" }, { kode: "asc" }] });
  }

  async get(kode) {
    const item = await this.prisma.barang.findUnique({ where: { kode: kode.toUpperCase() } });
    if (!item) throw new HttpError(404, `Barang ${kode.toUpperCase()} tidak ditemukan.`);
    return item;
  }

  create(input) { return this.prisma.barang.create({ data: input }); }

  update(kode, input) {
    return this.prisma.barang.update({ where: { kode: kode.toUpperCase() }, data: input });
  }

  delete(kode) {
    return this.prisma.barang.delete({ where: { kode: kode.toUpperCase() } });
  }
}
