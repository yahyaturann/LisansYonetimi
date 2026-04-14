import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiHatasi, asyncYakala } from "../middleware/hata-middleware.js";
import { LisansServisi } from "../services/lisans-servisi.js";
const lisansOlusturmaSemasi = z.object({
    project_id: z.string().min(1, "Proje seçimi zorunludur."),
    expires_at: z
        .string()
        .datetime("Geçerli bir bitiş tarihi giriniz.")
        .nullable()
        .optional(),
    max_activations: z.coerce.number().int().positive().nullable().optional(),
    metadata: z
        .object({
        domain: z.string().nullable().optional(),
        ip: z.string().nullable().optional(),
        hwid: z.string().nullable().optional(),
        not: z.string().optional()
    })
        .default({})
});
export const adminLicenseRouter = Router();
// Tum lisanslari getir - BU ROUTE ONA GORE OLMALI
adminLicenseRouter.get("/", asyncYakala(async (req, res) => {
    const projectId = typeof req.query.project_id === "string" ? req.query.project_id : undefined;
    const servis = new LisansServisi(prisma);
    const lisanslar = await servis.listele(projectId);
    res.json({
        success: true,
        message: "Lisanslar getirildi.",
        data: lisanslar
    });
}));
// Yeni lisans olustur
adminLicenseRouter.post("/create", asyncYakala(async (req, res) => {
    const veri = lisansOlusturmaSemasi.parse(req.body);
    const servis = new LisansServisi(prisma);
    const lisans = await servis.olustur({
        projectId: veri.project_id,
        expiresAt: veri.expires_at ? new Date(veri.expires_at) : null,
        maxActivations: veri.max_activations ?? null,
        metadata: veri.metadata
    });
    res.status(201).json({
        success: true,
        message: "Lisans oluşturuldu.",
        data: lisans
    });
}));
// Lisans sil
adminLicenseRouter.delete("/:id", asyncYakala(async (req, res) => {
    const servis = new LisansServisi(prisma);
    const lisansId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        await servis.sil(lisansId);
        res.json({
            success: true,
            message: "Lisans silindi."
        });
    }
    catch {
        throw new ApiHatasi("Lisans bulunamadı.", 404);
    }
}));
// Proje bazli lisans listele
adminLicenseRouter.get("/project/:projectId", asyncYakala(async (req, res) => {
    const servis = new LisansServisi(prisma);
    const projeId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const lisanslar = await servis.listele(projeId);
    res.json({
        success: true,
        message: "Proje lisansları getirildi.",
        data: lisanslar
    });
}));
// Proje bazli lisans olustur
adminLicenseRouter.post("/project/:projectId", asyncYakala(async (req, res) => {
    const veri = lisansOlusturmaSemasi.parse(req.body);
    const servis = new LisansServisi(prisma);
    const projeId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const lisans = await servis.olustur({
        projectId: veri.project_id || projeId,
        expiresAt: veri.expires_at ? new Date(veri.expires_at) : null,
        maxActivations: veri.max_activations ?? null,
        metadata: {
            domain: veri.metadata.domain || null,
            ip: veri.metadata.ip || null,
            hwid: veri.metadata.hwid || null,
            not: veri.metadata.not
        }
    });
    res.status(201).json({
        success: true,
        message: "Lisans oluşturuldu.",
        data: lisans
    });
}));
//# sourceMappingURL=admin-license-routes.js.map