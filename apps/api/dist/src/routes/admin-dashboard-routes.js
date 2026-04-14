import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncYakala } from "../middleware/hata-middleware.js";
import { DashboardServisi } from "../services/dashboard-servisi.js";
export const adminDashboardRouter = Router();
adminDashboardRouter.get("/summary", asyncYakala(async (_req, res) => {
    const servis = new DashboardServisi(prisma);
    const ozet = await servis.ozetGetir();
    res.json({
        success: true,
        message: "Dashboard özeti getirildi.",
        data: ozet
    });
}));
//# sourceMappingURL=admin-dashboard-routes.js.map