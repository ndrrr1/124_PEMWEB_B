import { randomUUID } from "node:crypto";

const original = {
  kode: "DEMO-001",
  nama: "Mouse Wireless Demo",
  kategori: "Elektronik",
  stok: 10,
  harga: 85000,
};
const updated = {
  ...original,
  nama: "Mouse Wireless Demo Revisi",
  stok: 15,
  harga: 95000,
};

export function buildCollection(baseUrl) {
  function request(name, method, path, status, body) {
    const parsed = new URL(`${baseUrl}${path}`);
    return {
      id: randomUUID(),
      name,
      request: {
        method,
        ...(body
          ? {
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                  type: "text",
                },
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(body, null, 2),
                options: { raw: { language: "json" } },
              },
            }
          : {}),
        url: {
          raw: parsed.href,
          protocol: parsed.protocol.slice(0, -1),
          host: parsed.hostname.split("."),
          port: parsed.port,
          path: parsed.pathname.slice(1).split("/"),
          query: [],
          variable: [],
        },
      },
      event: [
        {
          listen: "test",
          script: {
            id: randomUUID(),
            type: "text/javascript",
            exec: [
              `pm.test('HTTP ${status}', function () { pm.response.to.have.status(${status}); });`,
            ],
          },
        },
      ],
      response: [],
    };
  }
  return {
    info: {
      _postman_id: randomUUID(),
      name: "Inventra - Express Prisma Neon",
      description:
        "Jalankan berurutan 01–07. Semua URL dan kode sudah terisi. Setelah DELETE, alur dapat diulang dari POST. Jika POST 409, hapus DEMO-001 lewat web atau kirim request 06 dahulu.",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    auth: { type: "noauth" },
    item: [
      request("01 - GET seluruh barang", "GET", "/api/barang", 200),
      request("02 - POST tambah barang", "POST", "/api/barang", 201, original),
      request("03 - GET detail hasil POST", "GET", "/api/barang/DEMO-001", 200),
      request(
        "04 - PUT edit barang",
        "PUT",
        "/api/barang/DEMO-001",
        200,
        updated,
      ),
      request("05 - GET detail hasil PUT", "GET", "/api/barang/DEMO-001", 200),
      request(
        "06 - DELETE hapus barang",
        "DELETE",
        "/api/barang/DEMO-001",
        200,
      ),
      request(
        "07 - GET sesudah DELETE (404 sesuai)",
        "GET",
        "/api/barang/DEMO-001",
        404,
      ),
    ],
  };
}
