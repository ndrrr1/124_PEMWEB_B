import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { setup } from "./setup.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
function run(file, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], { cwd: root, stdio: "inherit", env: process.env });
    child.on("error", reject);
    child.on("exit", (code, signal) => code === 0 || signal === "SIGINT" ? resolve()
      : reject(new Error("Langkah gagal. Periksa pesan di atas, lalu jalankan kembali npm run demo.")));
  });
}
try {
  await setup();
  const cli = fileURLToPath(new URL("../node_modules/prisma/build/index.js", import.meta.url));
  await run(cli, ["generate"]);
  await run(cli, ["migrate", "deploy"]);
  await run(fileURLToPath(new URL("../prisma/seed.js", import.meta.url)));
  await run(fileURLToPath(new URL("../src/index.js", import.meta.url)));
} catch (error) { console.error(`\n${error.message}`); process.exitCode = 1; }
