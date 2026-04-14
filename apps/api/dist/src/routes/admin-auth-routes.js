import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { asyncYakala } from "../middleware/hata-middleware.js";
import { prisma } from "../lib/prisma.js";
import { AuthServisi } from "../services/auth-servisi.js";
import { authKullaniciDeposuOlustur } from "../services/prisma-depolari.js";
const girisSemasi = z.object({
    email: z.email("Geçerli bir e-posta adresi giriniz."),
    password: z.string().min(1, "Şifre alanı zorunludur.")
});
export const adminAuthRouter = Router();
adminAuthRouter.post("/login", asyncYakala(async (req, res) => {
    const veri = girisSemasi.parse(req.body);
    const servis = new AuthServisi(authKullaniciDeposuOlustur(prisma), env.JWT_SECRET);
    const sonuc = await servis.girisYap(veri);
    res.status(sonuc.success ? 200 : 401).json(sonuc);
}));
//# sourceMappingURL=admin-auth-routes.js.map