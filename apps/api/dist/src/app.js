import cors from "cors";
import express from "express";
import helmet from "helmet";
import { adminYetkiMiddleware } from "./middleware/admin-yetki-middleware.js";
import { hataMiddleware } from "./middleware/hata-middleware.js";
import { istekGunluguMiddleware } from "./middleware/istek-gunlugu-middleware.js";
import { genelRateLimitMiddleware, lisansRateLimitMiddleware } from "./middleware/rate-limit-middleware.js";
import { adminAuthRouter } from "./routes/admin-auth-routes.js";
import { adminDashboardRouter } from "./routes/admin-dashboard-routes.js";
import { adminLicenseRouter } from "./routes/admin-license-routes.js";
import { adminLogRouter } from "./routes/admin-log-routes.js";
import { adminProjectRouter } from "./routes/admin-project-routes.js";
import { licenseRouter } from "./routes/license-routes.js";
export function appOlustur() {
    const app = express();
    app.use(helmet());
    app.use(cors({
        origin: true
    }));
    app.use(express.json());
    app.use(istekGunluguMiddleware);
    app.use(genelRateLimitMiddleware);
    app.get("/health", (_req, res) => {
        res.json({
            success: true,
            message: "Servis çalışıyor."
        });
    });
    app.use("/api/admin/auth", adminAuthRouter);
    app.use("/api/license", lisansRateLimitMiddleware, licenseRouter);
    app.use("/api/admin/dashboard", adminYetkiMiddleware, adminDashboardRouter);
    app.use("/api/admin/projects", adminYetkiMiddleware, adminProjectRouter);
    app.use("/api/admin/project", adminYetkiMiddleware, adminProjectRouter);
    app.use("/api/admin/licenses", adminYetkiMiddleware, adminLicenseRouter);
    app.use("/api/admin/license", adminYetkiMiddleware, adminLicenseRouter);
    app.use("/api/admin/logs", adminYetkiMiddleware, adminLogRouter);
    app.use(hataMiddleware);
    return app;
}
//# sourceMappingURL=app.js.map