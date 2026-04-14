import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { bellekPrisma } from "./bellek-prisma.js";
const gercekPrisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = gercekPrisma;
}
export const prisma = (env.DEMO_MODU ? bellekPrisma : gercekPrisma);
//# sourceMappingURL=prisma.js.map