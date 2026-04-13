import { resolve } from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: resolve(process.cwd(), "../../.env") });
dotenv.config();

const envSemasi = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL tanımlanmalıdır."),
  JWT_SECRET: z.string().min(10, "JWT_SECRET en az 10 karakter olmalıdır."),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6, "ADMIN_PASSWORD en az 6 karakter olmalıdır."),
  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:4000"),
  PORT: z.coerce.number().default(4000),
  DEMO_MODU: z
    .enum(["true", "false"])
    .default("false")
    .transform((deger) => deger === "true")
});

export const env = envSemasi.parse(process.env);
