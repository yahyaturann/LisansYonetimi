import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";

import { AuthServisi, type AuthKullaniciDeposu } from "./auth-servisi";

describe("AuthServisi", () => {
  it("geçerli bilgilerle giriş yapıldığında token üretir", async () => {
    const parolaHash = await bcrypt.hash("123456", 10);
    const depo: AuthKullaniciDeposu = {
      kullaniciBul: vi.fn().mockResolvedValue({
        id: "kullanici_1",
        email: "admin@yerel.test",
        password: parolaHash
      })
    };
    const servis = new AuthServisi(depo, "gizli_anahtar");

    const sonuc = await servis.girisYap({
      email: "admin@yerel.test",
      password: "123456"
    });

    expect(sonuc.success).toBe(true);
    expect(sonuc.message).toBe("Giriş başarılı.");
    expect(sonuc.token).toBeTypeOf("string");
  });

  it("yanlış parola verildiğinde Türkçe hata döner", async () => {
    const parolaHash = await bcrypt.hash("123456", 10);
    const depo: AuthKullaniciDeposu = {
      kullaniciBul: vi.fn().mockResolvedValue({
        id: "kullanici_1",
        email: "admin@yerel.test",
        password: parolaHash
      })
    };
    const servis = new AuthServisi(depo, "gizli_anahtar");

    const sonuc = await servis.girisYap({
      email: "admin@yerel.test",
      password: "yanlis"
    });

    expect(sonuc.success).toBe(false);
    expect(sonuc.message).toBe("E-posta veya şifre hatalı.");
  });
});
