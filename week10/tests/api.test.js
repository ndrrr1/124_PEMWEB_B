import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createApp } from "../src/app.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const input = { kode: "TEST-001", nama: "Barang Pengujian", kategori: "Elektronik", stok: 10, harga: 85000 };

test("Integrasi Express dan PostgreSQL", { skip: !process.env.TEST_DATABASE_URL }, async (t) => {
  const testUrl = new URL(process.env.TEST_DATABASE_URL);
  assert.match(testUrl.pathname, /_test$/, "TEST_DATABASE_URL harus memakai database terpisah dengan akhiran _test.");
  process.env.DATABASE_URL = testUrl.href;
  process.env.DATABASE_URL_UNPOOLED = testUrl.href;
  const { createDatabase } = await import("../src/lib/prisma.js");
  const prisma = createDatabase();
  let server, base;
  async function launch(client) {
    const app = await createApp({ prisma: client, log: false });
    server = app.listen(0, "127.0.0.1"); await once(server, "listening");
    base = `http://127.0.0.1:${server.address().port}`;
  }
  async function request(method, path, body, headers = {}) {
    const response = await fetch(base + path, { method, headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      ...(body !== undefined ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}) });
    return { status: response.status, headers: response.headers, data: await response.json() };
  }
  try {
    // Tabel public mewakili data challenge lain dalam project yang sama.
    await prisma.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS public."LegacyChallenge" (id INT PRIMARY KEY)');
    await prisma.$executeRawUnsafe('INSERT INTO public."LegacyChallenge" (id) VALUES (1) ON CONFLICT DO NOTHING');
    const migration = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { cwd: root, env: process.env, encoding: "utf8" });
    assert.equal(migration.status, 0, migration.stderr + migration.stdout);
    await prisma.barang.deleteMany();
    const { contohBarang } = await import("../prisma/seed-data.js");
    await prisma.barang.createMany({ data: contohBarang });
    await launch(prisma);

    await t.test("GET menampilkan data dan total yang benar", async () => {
      const r = await request("GET", "/api/barang");
      assert.equal(r.status, 200); assert.equal(r.data.data.length, 6);
      assert.equal(r.data.meta.totalStok, 130); assert.equal(r.data.meta.totalNilai, 6882000);
    });
    await t.test("Health memeriksa koneksi database", async () => {
      const r = await request("GET", "/api/health");
      assert.equal(r.status, 200); assert.equal(r.data.database, "connected");
      assert.equal(r.data.orm, "Prisma"); assert.equal(r.data.schema, "inventra");
    });
    await t.test("POST tersimpan sebagai record PostgreSQL", async () => {
      const r = await request("POST", "/api/barang", input);
      assert.equal(r.status, 201); assert.equal(r.headers.get("location"), "/api/barang/TEST-001");
      assert.equal((await prisma.barang.findUnique({ where: { kode: input.kode } })).nama, input.nama);
    });
    await t.test("Kode duplikat ditolak termasuk huruf kecil", async () => {
      assert.equal((await request("POST", "/api/barang", { ...input, kode: "test-001" })).status, 409);
      assert.equal(await prisma.barang.count({ where: { kode: input.kode } }), 1);
    });
    await t.test("GET detail menerima kode tanpa memperhatikan kapital", async () => {
      const r = await request("GET", "/api/barang/test-001"); assert.equal(r.status, 200);
      assert.equal(r.data.data.nama, input.nama);
    });
    await t.test("PUT memperbarui barang yang dipilih", async () => {
      const r = await request("PUT", "/api/barang/TEST-001", { ...input, stok: 17, nama: "Barang Diperbarui" });
      assert.equal(r.status, 200); assert.equal(r.data.data.stok, 17);
      assert.equal((await prisma.barang.findUnique({ where: { kode: "ATK-001" } })).stok, 42);
    });
    await t.test("Restart server dan Prisma Client mempertahankan data", async () => {
      await new Promise((resolve) => server.close(resolve));
      await prisma.$disconnect();
      const fresh = createDatabase();
      await launch(fresh);
      assert.equal((await request("GET", "/api/barang/TEST-001")).data.data.stok, 17);
      await new Promise((resolve) => server.close(resolve)); await fresh.$disconnect();
      await launch(prisma);
    });
    await t.test("Input invalid menghasilkan 400", async () => {
      for (const body of [{ ...input, stok: -1 }, { ...input, stok: "2" }, { ...input, harga: 1.5 }, { ...input, kategori: "Lain" }, { ...input, extra: true }, [], { kode: input.kode }]) {
        assert.equal((await request("POST", "/api/barang", body)).status, 400);
      }
    });
    await t.test("PUT menolak perubahan kode dan body tidak lengkap", async () => {
      for (const body of [{ ...input, kode: "BEDA-001" }, { kode: input.kode }]) {
        assert.equal((await request("PUT", "/api/barang/TEST-001", body)).status, 400);
      }
      assert.equal((await prisma.barang.findUnique({ where: { kode: input.kode } })).stok, 17);
    });
    await t.test("JSON rusak dan Content-Type salah ditolak", async () => {
      assert.equal((await request("POST", "/api/barang", '{"kode":')).status, 400);
      assert.equal((await request("POST", "/api/barang", input, { "Content-Type": "text/plain" })).status, 415);
    });
    await t.test("Constraint database menjaga kode saat request bersamaan", async () => {
      const body = { ...input, kode: "TEST-RACE" };
      const result = await Promise.all([request("POST", "/api/barang", body), request("POST", "/api/barang", body)]);
      assert.deepEqual(result.map((r) => r.status).sort(), [201, 409]);
      await request("DELETE", "/api/barang/TEST-RACE");
    });
    await t.test("DELETE menghapus record, pembacaan berikutnya 404", async () => {
      assert.equal((await request("DELETE", "/api/barang/TEST-001")).status, 200);
      assert.equal(await prisma.barang.findUnique({ where: { kode: input.kode } }), null);
      assert.equal((await request("GET", "/api/barang/TEST-001")).status, 404);
      assert.equal((await request("DELETE", "/api/barang/TEST-001")).status, 404);
      assert.equal((await request("PUT", "/api/barang/TEST-001", input)).status, 404);
    });
    await t.test("Seed ulang tidak menimpa perubahan pengguna", async () => {
      await prisma.barang.update({ where: { kode: "ATK-001" }, data: { stok: 19 } });
      await prisma.barang.createMany({ data: contohBarang, skipDuplicates: true });
      assert.equal((await prisma.barang.findUnique({ where: { kode: "ATK-001" } })).stok, 19);
    });
    await t.test("Migrasi dan data tidak menyentuh schema public", async () => {
      const rows = await prisma.$queryRawUnsafe('SELECT id FROM public."LegacyChallenge"');
      assert.deepEqual(rows, [{ id: 1 }]);
    });
    await t.test("File konfigurasi tidak dapat diunduh lewat web", async () => {
      for (const path of ["/.env", "/prisma/schema.prisma", "/src/lib/env.js", "/api/tidak-ada"]) {
        assert.equal((await request("GET", path)).status, 404);
      }
    });
    await t.test("Collection memiliki URL dan body lengkap", async () => {
      const r = await request("GET", "/postman-collection.json");
      assert.equal(r.status, 200); assert.equal(r.data.item.length, 7);
      assert.equal(JSON.stringify(r.data).includes("{{"), false);
      for (const item of r.data.item) { assert.ok(new URL(item.request.url.raw)); if (item.request.body) JSON.parse(item.request.body.raw); }
    });
  } finally {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }
});
