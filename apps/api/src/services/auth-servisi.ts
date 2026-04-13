import bcrypt from "bcryptjs";

import { tokenUret } from "../utils/jwt.js";

export type AuthKullaniciKaydi = {
  id: string;
  email: string;
  password: string;
};

export interface AuthKullaniciDeposu {
  kullaniciBul(email: string): Promise<AuthKullaniciKaydi | null>;
}

type GirisBilgileri = {
  email: string;
  password: string;
};

export class AuthServisi {
  constructor(
    private readonly depo: AuthKullaniciDeposu,
    private readonly jwtSecret: string
  ) {}

  async girisYap(girdi: GirisBilgileri) {
    const kullanici = await this.depo.kullaniciBul(girdi.email);

    if (!kullanici) {
      return {
        success: false,
        message: "E-posta veya şifre hatalı."
      };
    }

    const parolaDogruMu = await bcrypt.compare(girdi.password, kullanici.password);

    if (!parolaDogruMu) {
      return {
        success: false,
        message: "E-posta veya şifre hatalı."
      };
    }

    return {
      success: true,
      message: "Giriş başarılı.",
      token: tokenUret(
        {
          sub: kullanici.id,
          email: kullanici.email
        },
        this.jwtSecret
      )
    };
  }
}
