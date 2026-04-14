import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncYakala, ApiHatasi } from "../middleware/hata-middleware.js";
import { ProjeServisi } from "../services/proje-servisi.js";
import { varsayilanProjeAyarlari } from "../types/domain.js";
const ayarSemasi = z.object({
    domain_kontrol: z.boolean().default(varsayilanProjeAyarlari.domain_kontrol),
    ip_kontrol: z.boolean().default(varsayilanProjeAyarlari.ip_kontrol),
    hwid_kontrol: z.boolean().default(varsayilanProjeAyarlari.hwid_kontrol),
    sure_kontrol: z.boolean().default(varsayilanProjeAyarlari.sure_kontrol),
    aktivasyon_limiti: z.boolean().default(varsayilanProjeAyarlari.aktivasyon_limiti)
});
const projeOlusturmaSemasi = z.object({
    name: z.string().min(2, "Proje adı en az 2 karakter olmalıdır."),
    settings: ayarSemasi.partial().optional(),
    license_prefix: z.string().min(2, "Lisans öneki en az 2 karakter olmalıdır.").max(10, "Lisans öneki en fazla 10 karakter olabilir.").regex(/^[A-Z0-9]+$/, "Sadece büyük harf ve rakam kullanılabilir.").optional()
});
const ayarGuncellemeSemasi = z.object({
    settings: ayarSemasi.partial()
});
export const adminProjectRouter = Router();
adminProjectRouter.get("/", asyncYakala(async (_req, res) => {
    const servis = new ProjeServisi(prisma);
    const projeler = await servis.listele();
    res.json({
        success: true,
        message: "Projeler getirildi.",
        data: projeler
    });
}));
adminProjectRouter.post("/create", asyncYakala(async (req, res) => {
    const veri = projeOlusturmaSemasi.parse(req.body);
    const servis = new ProjeServisi(prisma);
    const proje = await servis.olustur(veri.name, veri.settings, veri.license_prefix);
    res.status(201).json({
        success: true,
        message: "Proje oluşturuldu.",
        data: proje
    });
}));
adminProjectRouter.patch("/:id/settings", asyncYakala(async (req, res) => {
    const veri = ayarGuncellemeSemasi.parse(req.body);
    const servis = new ProjeServisi(prisma);
    const projeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const proje = await servis.ayarlariGuncelle(projeId, veri.settings);
        res.json({
            success: true,
            message: "Proje ayarları güncellendi.",
            data: proje
        });
    }
    catch {
        throw new ApiHatasi("Proje bulunamadı.", 404);
    }
}));
// Proje detay bilgisi
adminProjectRouter.get("/:id", asyncYakala(async (req, res) => {
    const servis = new ProjeServisi(prisma);
    const projeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const proje = await servis.bul(projeId);
    if (!proje) {
        throw new ApiHatasi("Proje bulunamadı.", 404);
    }
    res.json({
        success: true,
        message: "Proje bilgileri getirildi.",
        data: proje
    });
}));
//# sourceMappingURL=admin-project-routes.js.map