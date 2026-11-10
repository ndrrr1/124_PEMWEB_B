import { databaseConfig } from "../src/lib/env.js";
try { databaseConfig(); console.log("Format koneksi database siap."); }
catch (error) { console.error(error.message); process.exitCode = 1; }
