const [major, minor] = process.versions.node.split(".").map(Number);
if (!((major === 22 && minor >= 12) || major === 24 || major >= 26)) {
  console.error(
    "Gunakan Node.js 24 LTS atau 22.12+. Versi saat ini:",
    process.version,
  );
  process.exitCode = 1;
}
