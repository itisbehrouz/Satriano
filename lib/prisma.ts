import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
  adapter?: PrismaPg;
};

if (!globalForPrisma.pool) {
  const connectionString = process.env.DATABASE_URL;
  globalForPrisma.pool = new Pool({ connectionString });
  globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: globalForPrisma.adapter! });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
