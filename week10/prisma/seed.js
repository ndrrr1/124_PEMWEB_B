import { createDatabase } from "../src/lib/prisma.js";
import { databaseErrorMessage } from "../src/lib/database-error.js";
import { contohBarang } from "./seed-data.js";

const prisma = createDatabase();
try {
  const result = await prisma.barang.createMany({ data: contohBarang, skipDuplicates: true });
  console.log(`Data contoh: ${result.count} barang ditambahkan. Data yang sudah ada tetap tersimpan.`);
} catch (error) {
  console.error(databaseErrorMessage(error));
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
