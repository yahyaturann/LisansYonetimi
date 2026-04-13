import { PrismaClient } from "@prisma/client";

import { env } from "../config/env.js";
import { bellekPrisma } from "./bellek-prisma.js";

declare global {
  var __prisma: PrismaClient | undefined;
}

const gercekPrisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = gercekPrisma;
}

export const prisma = (env.DEMO_MODU ? bellekPrisma : gercekPrisma) as unknown as PrismaClient;
