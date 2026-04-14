import dotenv from "dotenv";
import { z } from "zod";

// Sunucuda environment variable olarak tanımlanabilir,
// veya aynı klasördeki .env dosyasından okunabilir
dotenv.config({ path: process.cwd() + "/.env" });
dotenv.config();

const envSemasi = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL tanımlanmalıdır."),
  JWT_SECRET: z.string().min(10, "JWT_SECRET en az 10 karakter olmalıdır."),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6, "ADMIN_PASSWORD en az 6 karakter olmalıdır."),
  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:4000"),
  PORT: z.coerce.number().default(4000),
  DEMO_MODU: z
    .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
    .default("false")
    .transform((deger) => deger === "true" || deger === "1")
});

export const env = envSemasi.parse(process.env);
