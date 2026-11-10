import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeConnection, databaseConfig } from "../src/lib/env.js";

test("URL Neon pooled diturunkan menjadi direct dan memakai schema inventra", () => {
  const previous = { url: process.env.DATABASE_URL, direct: process.env.DATABASE_URL_UNPOOLED };
  try {
    process.env.DATABASE_URL = "postgresql://test:password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    delete process.env.DATABASE_URL_UNPOOLED;
    const value = databaseConfig();
    assert.equal(new URL(value.url).hostname.includes("-pooler"), true);
    assert.equal(new URL(value.directUrl).hostname.includes("-pooler"), false);
    assert.equal(new URL(value.directUrl).searchParams.get("schema"), "inventra");
    assert.equal(new URL(value.directUrl).searchParams.get("channel_binding"), "require");
    process.env.DATABASE_URL_UNPOOLED = "postgresql://test:password@ep-other.ap-southeast-1.aws.neon.tech/neondb";
    assert.throws(databaseConfig, /branch dan database yang sama/);
  } finally {
    if (previous.url === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previous.url;
    if (previous.direct === undefined) delete process.env.DATABASE_URL_UNPOOLED; else process.env.DATABASE_URL_UNPOOLED = previous.direct;
  }
});
test("URL kosong, contoh, dan protokol lain ditolak", () => {
  for (const value of ["", "https://example.com", "postgresql://test:pass@ep-NAMA-BRANCH.neon.tech/neondb"]) {
    assert.throws(() => normalizeConnection(value));
  }
});
test("Salinan psql dari Neon dan password terenkode diterima", () => {
  const url = normalizeConnection("psql 'postgresql://test:p%40ss@ep-sample.neon.tech/neondb?sslmode=require'");
  assert.equal(url.password, "p%40ss");
  assert.equal(url.searchParams.get("schema"), "inventra");
});
