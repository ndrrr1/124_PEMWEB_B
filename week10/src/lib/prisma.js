import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { databaseConfig, databaseSchema } from "./env.js";

export function createDatabase() {
  const { url } = databaseConfig();
  const adapter = new PrismaPg({ connectionString: url, max: 5, connectionTimeoutMillis: 20000, idleTimeoutMillis: 30000 }, { schema: databaseSchema });
  return new PrismaClient({ adapter, log: [] });
}
