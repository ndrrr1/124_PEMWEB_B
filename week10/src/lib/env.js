import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

export const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
export const databaseSchema = "inventra";
dotenv.config({ path: envPath, quiet: true });

export function normalizeConnection(value) {
  let raw = String(value || "").trim();
  // Neon juga menyediakan salinan berbentuk: psql 'postgresql://...'.
  raw = raw.replace(/^psql\s+/i, "").replace(/^['"]|['"]$/g, "");
  let url;
  try { url = new URL(raw); } catch {
    throw new Error("Isi DATABASE_URL dengan connection string lengkap dari Neon > Connect.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.username || !url.password || url.pathname.length < 2) {
    throw new Error("Connection string harus memuat user, password, host, dan nama database PostgreSQL.");
  }
  if (/NAMA-BRANCH|YOUR_|\[|\]|<|>/i.test(raw)) {
    throw new Error("Connection string masih contoh. Salin URL asli dari Neon > Connect.");
  }
  if (url.hostname.endsWith(".neon.tech") && !url.searchParams.has("sslmode")) url.searchParams.set("sslmode", "require");
  url.searchParams.set("schema", databaseSchema);
  return url;
}

export function databaseConfig() {
  if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL belum diisi. Jalankan npm run setup, lalu tempel connection string Neon.");
  const pooled = normalizeConnection(process.env.DATABASE_URL);
  const direct = process.env.DATABASE_URL_UNPOOLED?.trim()
    ? normalizeConnection(process.env.DATABASE_URL_UNPOOLED) : new URL(pooled.href);
  if (!process.env.DATABASE_URL_UNPOOLED?.trim() && direct.hostname.endsWith(".neon.tech")) direct.hostname = direct.hostname.replace(/-pooler(?=\.)/, "");
  const unpool = (host) => host.replace(/-pooler(?=\.)/, "");
  if (unpool(pooled.hostname) !== unpool(direct.hostname) || pooled.pathname !== direct.pathname || pooled.port !== direct.port) throw new Error("DATABASE_URL dan DATABASE_URL_UNPOOLED harus berasal dari branch dan database yang sama.");
  return { url: pooled.href, directUrl: direct.href };
}
