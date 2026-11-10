CREATE SCHEMA IF NOT EXISTS "inventra";

CREATE TABLE "inventra"."Barang" (
    "kode" VARCHAR(30) NOT NULL,
    "nama" VARCHAR(80) NOT NULL,
    "kategori" VARCHAR(30) NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "harga" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Barang_pkey" PRIMARY KEY ("kode"),
    CONSTRAINT "Barang_stok_check" CHECK ("stok" BETWEEN 0 AND 100000),
    CONSTRAINT "Barang_harga_check" CHECK ("harga" BETWEEN 0 AND 1000000000),
    CONSTRAINT "Barang_kategori_check" CHECK ("kategori" IN ('Alat Tulis', 'Elektronik', 'Aksesori', 'Perlengkapan'))
);

CREATE INDEX "Barang_kategori_idx" ON "inventra"."Barang"("kategori");
