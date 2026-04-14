export class DashboardServisi {
    db;
    constructor(db) {
        this.db = db;
    }
    async ozetGetir() {
        const [projeSayisi, lisansSayisi, aktivasyonSayisi, sonLoglar] = await Promise.all([
            this.db.project.count(),
            this.db.license.count(),
            this.db.activation.count(),
            this.db.log.findMany({
                include: {
                    project: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 5
            })
        ]);
        return {
            proje_sayisi: projeSayisi,
            lisans_sayisi: lisansSayisi,
            aktivasyon_sayisi: aktivasyonSayisi,
            son_loglar: sonLoglar
        };
    }
}
//# sourceMappingURL=dashboard-servisi.js.map