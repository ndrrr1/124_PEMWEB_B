import { Router } from "express";
import { createBarangController } from "../controllers/barang.controller.js";
import { validateBarang } from "../middleware/validate-barang.js";

export function createBarangRouter(repository) {
  const router = Router();
  const controller = createBarangController(repository);
  router.get("/", controller.list);
  router.get("/:kode", controller.detail);
  router.post("/", validateBarang, controller.create);
  router.put("/:kode", validateBarang, controller.update);
  router.delete("/:kode", controller.delete);
  return router;
}
