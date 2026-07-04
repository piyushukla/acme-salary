import { PrismaClient } from "@prisma/client";

// Single shared Prisma client. In serverless, reuse across invocations to avoid
// exhausting connections (the classic hot-reload / cold-start leak).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
