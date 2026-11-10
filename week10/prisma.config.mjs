import { defineConfig } from "prisma/config";
import { databaseConfig } from "./src/lib/env.js";

// Generate tidak memerlukan koneksi. Perintah migrasi memanggil check:env.
const url = process.env.DATABASE_URL?.trim() ? databaseConfig().directUrl
  : "postgresql://unused:unused@localhost:5432/unused?schema=inventra";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node prisma/seed.js" },
  datasource: { url },
});
