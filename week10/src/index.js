import { writeFile } from "node:fs/promises";
import { once } from "node:events";
import { createApp } from "./app.js";
import { buildCollection } from "../scripts/postman-collection.js";
import { createDatabase } from "./lib/prisma.js";
import { databaseErrorMessage } from "./lib/database-error.js";

let prisma;
try {
  prisma = createDatabase();
  await prisma.$queryRaw`SELECT 1`;
  const requestedPort = Number(process.env.PORT || 3000);
  if (
    !Number.isInteger(requestedPort) ||
    requestedPort < 1 ||
    requestedPort > 65525
  )
    throw new Error("PORT harus angka 1–65525.");
  const app = await createApp({ prisma });
  let server;
  for (let port = requestedPort; port < requestedPort + 10; port += 1) {
    const candidate = app.listen(port, process.env.HOST || "0.0.0.0");
    try {
      await once(candidate, "listening");
      server = candidate;
      break;
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  if (!server)
    throw new Error(
      "Sepuluh port berurutan sedang dipakai. Hentikan server lama, lalu jalankan lagi.",
    );
  const baseUrl = `http://localhost:${server.address().port}`;
  app.locals.baseUrl = baseUrl;
  try {
    await writeFile(
      new URL("../postman/Inventra.postman_collection.json", import.meta.url),
      `${JSON.stringify(buildCollection(baseUrl), null, 2)}\n`,
    );
  } catch (error) {
    console.warn(
      "File collection tidak dapat ditulis. Unduh lewat /postman-collection.json.",
      error.message,
    );
  }
  console.log(
    `\nINVENTRA SIAP\nWebsite   : ${baseUrl}\nPostman   : postman/Inventra.postman_collection.json\nDatabase  : PostgreSQL / schema inventra / Prisma\nHentikan  : Ctrl+C\n`,
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => {
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
      setTimeout(() => process.exit(0), 5000).unref();
    });
} catch (error) {
  console.error(`\nGagal menjalankan Inventra: ${databaseErrorMessage(error)}\n`);
  await prisma?.$disconnect();
  process.exitCode = 1;
}
