import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncYakala } from "../middleware/hata-middleware.js";
import { LisansDogrulamaServisi } from "../services/lisans-dogrulama-servisi.js";
import { lisansDogrulamaDeposuOlustur } from "../services/prisma-depolari.js";
import { tarihiIsoOlarakDondur } from "../utils/zaman.js";
const lisansDogrulamaSemasi = z.object({
    license_key: z.string().min(1, "Lisans anahtarı zorunludur."),
    project_id: z.string().min(1, "Proje kimliği zorunludur."),
    domain: z.string().optional(),
    ip: z.string().optional(),
    hwid: z.string().optional()
});
export const licenseRouter = Router();
licenseRouter.post("/validate", asyncYakala(async (req, res, next) => {
    const veri = lisansDogrulamaSemasi.parse(req.body);
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
        res.status(401).json({
            success: false,
            message: "API anahtarı zorunludur.",
            expires_at: null,
            remaining_activations: null
        });
        return;
    }
    const servis = new LisansDogrulamaServisi(lisansDogrulamaDeposuOlustur(prisma));
    const sonuc = await servis.dogrula({
        projectId: veri.project_id,
        apiKey,
        licenseKey: veri.license_key,
        domain: veri.domain,
        ip: veri.ip,
        hwid: veri.hwid
    });
    res.status(sonuc.success ? 200 : 400).json({
        success: sonuc.success,
        message: sonuc.message,
        expires_at: tarihiIsoOlarakDondur(sonuc.expiresAt),
        remaining_activations: sonuc.remainingActivations
    });
}));
//# sourceMappingURL=license-routes.js.map