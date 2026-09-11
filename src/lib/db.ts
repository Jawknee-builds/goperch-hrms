import "dotenv/config";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:") && !envUrl.includes("dev.db")) {
    return envUrl;
  }
  const absolutePath = path.join(process.cwd(), "dev.db");
  return `file:${absolutePath}`;
}

const adapter = new PrismaLibSql({ url: getDatabaseUrl() });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;