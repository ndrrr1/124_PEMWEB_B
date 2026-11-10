import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";
import { envPath, normalizeConnection, databaseConfig } from "../src/lib/env.js";

export async function setup() {
  if (process.env.DATABASE_URL?.trim()) { databaseConfig(); return; }
  if (!process.stdin.isTTY) throw new Error("Isi DATABASE_URL di .env, lalu jalankan lagi. Contoh tersedia di .env.example.");
  console.log("\nBuka https://console.neon.tech > project > Connect.");
  console.log("Salin connection string PostgreSQL dengan pooling aktif.");
  const input = createInterface({ input: process.stdin, output: process.stdout });
  try {
    let value;
    while (!value) {
      const answer = await input.question("Tempel URL Neon, lalu Enter: ");
      try { value = normalizeConnection(answer).href; } catch (error) { console.error(error.message); }
    }
    let content = await readFile(envPath, "utf8").catch(() => "PORT=3000\n");
    const set = (key, next) => {
      const line = `${key}=${JSON.stringify(next)}`;
      const pattern = new RegExp(`^${key}=.*$`, "m");
      content = pattern.test(content) ? content.replace(pattern, () => line) : `${content.trimEnd()}\n${line}\n`;
    };
    set("DATABASE_URL", value); set("DATABASE_URL_UNPOOLED", "");
    await writeFile(envPath, content, { mode: 0o600 });
    process.env.DATABASE_URL = value; process.env.DATABASE_URL_UNPOOLED = "";
    databaseConfig(); console.log("Koneksi disimpan di .env.\n");
  } finally { input.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  setup().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
