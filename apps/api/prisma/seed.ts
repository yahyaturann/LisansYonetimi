import bcrypt from "bcryptjs";

import { env } from "../src/config/env.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const parolaHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: {
      email: env.ADMIN_EMAIL
    },
    update: {
      password: parolaHash
    },
    create: {
      email: env.ADMIN_EMAIL,
      password: parolaHash
    }
  });

  console.log("Varsayılan admin kullanıcısı hazırlandı.");
}

main()
  .catch((hata) => {
    console.error("Seed işlemi sırasında hata oluştu:", hata);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
