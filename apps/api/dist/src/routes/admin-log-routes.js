import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncYakala } from "../middleware/hata-middleware.js";
import { LogServisi } from "../services/log-servisi.js";
export const adminLogRouter = Router();
adminLogRouter.get("/", asyncYakala(async (req, res) => {
    const projectId = typeof req.query.project_id === "string" ? req.query.project_id : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
    const servis = new LogServisi(prisma);
    const loglar = await servis.listele(projectId, Number.isNaN(limit) ? 50 : limit);
    res.json({
        success: true,
        message: "Log kayıtları getirildi.",
        data: loglar
    });
}));
//# sourceMappingURL=admin-log-routes.js.map