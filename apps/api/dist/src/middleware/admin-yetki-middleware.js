import { ApiHatasi } from "./hata-middleware.js";
import { tokenDogrula } from "../utils/jwt.js";
export function adminYetkiMiddleware(req, _res, next) {
    // Demo modunda auth kontrolünü devre dışı bırak
    if (process.env.DEMO_MODU === "true") {
        req.admin = {
            id: "demo-user",
            email: "demo@demo.com"
        };
        return next();
    }
    const yetkiBasligi = req.headers.authorization;
    if (!yetkiBasligi?.startsWith("Bearer ")) {
        next(new ApiHatasi("Yetkisiz erişim.", 401));
        return;
    }
    try {
        const token = yetkiBasligi.replace("Bearer ", "");
        const icerik = tokenDogrula(token, process.env.JWT_SECRET);
        req.admin = {
            id: icerik.sub,
            email: icerik.email
        };
        next();
    }
    catch {
        next(new ApiHatasi("Oturum doğrulanamadı.", 401));
    }
}
//# sourceMappingURL=admin-yetki-middleware.js.map