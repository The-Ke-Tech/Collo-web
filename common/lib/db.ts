
// This file contains the database connection logic.
// It uses the Prisma Client to connect to the database.
// The Prisma Client is generated based on the Prisma schema.
// The Prisma schema is defined in the prisma/schema.prisma file.
// The Prisma Client is a type-safe database client that allows you to interact with the database.
// It is generated based on the Prisma schema and provides a type-safe API for querying the database.

import { PrismaClient } from "@prisma/client";

// The Prisma Client is generated using the Prisma CLI.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}