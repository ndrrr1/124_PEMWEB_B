import express from "express";
import { fileURLToPath } from "node:url";
import { BarangRepository } from "./repositories/barang.repository.js";
import { createBarangRouter } from "./routes/barang.routes.js";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler } from "./middleware/errors.js";
import { buildCollection } from "../scripts/postman-collection.js";

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));
export async function createApp({
  prisma,
  log = true,
} = {}) {
  if (!prisma) throw new Error("Prisma Client belum tersedia.");
  const repository = new BarangRepository(prisma);
  const app = express();
  app.disable("x-powered-by");
  if (log) app.use(requestLogger);
  app.use((_req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "Server Inventra aktif.",
      database: "connected",
      storage: "PostgreSQL",
      orm: "Prisma",
      schema: "inventra",
    });
  });
  app.use("/api/barang", createBarangRouter(repository));
  app.get("/postman-collection.json", (_req, res) => {
    res
      .attachment("Inventra.postman_collection.json")
      .json(buildCollection(app.locals.baseUrl || "http://localhost:3000"));
  });
  app.use(express.static(publicPath));
  app.use((_req, res) =>
    res
      .status(404)
      .json({ success: false, message: "Endpoint tidak ditemukan." }),
  );
  app.use(errorHandler);
  return app;
}
