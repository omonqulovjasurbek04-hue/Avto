// Prisma client singleton.
// Ensures a single PrismaClient instance is reused across the application,
// preventing connection pool exhaustion during hot-reloads in development.
import { PrismaClient } from "@prisma/client";
import { env } from "./env.mjs";

/** @type {PrismaClient} */
let prisma;

if (env.IS_PRODUCTION) {
  prisma = new PrismaClient({
    log: ["error"],
  });
} else {
  // In development, reuse the client across hot-reloads
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  prisma = globalThis.__prisma;
}

export { prisma };
