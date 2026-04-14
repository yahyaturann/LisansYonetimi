import { lisansAnahtariUret } from "../utils/license-key.js";
import { LogServisi } from "./log-servisi.js";
export class LisansServisi {
    db;
    logServisi;
    constructor(db) {
        this.db = db;
        this.logServisi = new LogServisi(db);
    }
    async olustur(girdi) {
        // Projenin prefix'ini al
        const proje = await this.db.project.findUnique({
            where: { id: girdi.projectId },
            select: { licensePrefix: true }
        });
        const prefix = proje?.licensePrefix || "LIS";
        const lisans = await this.db.license.create({
            data: {
                projectId: girdi.projectId,
                licenseKey: lisansAnahtariUret(prefix),
                expiresAt: girdi.expiresAt,
                maxActivations: girdi.maxActivations,
                metadata: girdi.metadata
            }
        });
        await this.logServisi.yaz(girdi.projectId, "Yeni lisans oluşturuldu.");
        return lisans;
    }
    async listele(projectId) {
        return this.db.license.findMany({
            where: projectId
                ? {
                    projectId
                }
                : undefined,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        licensePrefix: true
                    }
                },
                activations: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }
    async sil(id) {
        const lisans = await this.db.license.delete({
            where: {
                id
            }
        });
        await this.logServisi.yaz(lisans.projectId, "Lisans silindi.");
        return lisans;
    }
    async sonErisimZamaniniGuncelle(lisansId) {
        await this.db.license.update({
            where: {
                id: lisansId
            },
            data: {
                updatedAt: new Date()
            }
        });
    }
}
//# sourceMappingURL=lisans-servisi.js.map