import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Bump this when user/model relations change so HMR does not reuse a stale client.
const PRISMA_SCHEMA_STAMP = "user.department_id+user.created_by_id";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prisma_schema_stamp?: string;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;

  if (
    cached &&
    globalForPrisma.prisma_schema_stamp === PRISMA_SCHEMA_STAMP &&
    "user" in cached &&
    "legend" in cached
  ) {
    return cached;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prisma_schema_stamp = PRISMA_SCHEMA_STAMP;
  }

  return client;
}

export const prisma = getPrismaClient();
