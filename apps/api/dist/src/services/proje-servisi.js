import { varsayilanProjeAyarlari } from "../types/domain.js";
import { apiAnahtariUret } from "../utils/api-key.js";
import { LogServisi } from "./log-servisi.js";
export class ProjeServisi {
    db;
    logServisi;
    constructor(db) {
        this.db = db;
        this.logServisi = new LogServisi(db);
    }
    async listele() {
        return this.db.project.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
    }
    async bul(projectId) {
        return this.db.project.findUnique({
            where: {
                id: projectId
            }
        });
    }
    async olustur(name, settings, licensePrefix) {
        const proje = await this.db.project.create({
            data: {
                name,
                apiKey: apiAnahtariUret(),
                licensePrefix: licensePrefix?.toUpperCase() || "LIS",
                settings: {
                    ...varsayilanProjeAyarlari,
                    ...settings
                }
            }
        });
        await this.logServisi.yaz(proje.id, "Proje oluşturuldu.");
        return proje;
    }
    async ayarlariGuncelle(projectId, settings) {
        const proje = await this.db.project.update({
            where: {
                id: projectId
            },
            data: {
                settings: {
                    ...varsayilanProjeAyarlari,
                    ...settings
                }
            }
        });
        await this.logServisi.yaz(projectId, "Proje ayarları güncellendi.");
        return proje;
    }
}
//# sourceMappingURL=proje-servisi.js.map