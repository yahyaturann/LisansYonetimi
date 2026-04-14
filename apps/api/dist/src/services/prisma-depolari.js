export function authKullaniciDeposuOlustur(db) {
    return {
        kullaniciBul(email) {
            return db.user.findUnique({
                where: {
                    email
                }
            });
        }
    };
}
export function lisansDogrulamaDeposuOlustur(db) {
    return {
        async projeBul(projectId) {
            const proje = await db.project.findUnique({
                where: {
                    id: projectId
                }
            });
            if (!proje) {
                return null;
            }
            return {
                id: proje.id,
                name: proje.name,
                apiKey: proje.apiKey,
                settings: proje.settings
            };
        },
        async lisansBul(projectId, licenseKey) {
            const lisans = await db.license.findFirst({
                where: {
                    projectId,
                    licenseKey
                },
                include: {
                    activations: {
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            });
            if (!lisans) {
                return null;
            }
            return {
                id: lisans.id,
                projectId: lisans.projectId,
                licenseKey: lisans.licenseKey,
                expiresAt: lisans.expiresAt,
                maxActivations: lisans.maxActivations,
                metadata: lisans.metadata,
                activations: lisans.activations.map((aktivasyon) => ({
                    id: aktivasyon.id,
                    createdAt: aktivasyon.createdAt
                }))
            };
        },
        async aktivasyonOlustur(girdi) {
            await db.activation.create({
                data: {
                    licenseId: girdi.licenseId,
                    ip: girdi.ip,
                    domain: girdi.domain,
                    hwid: girdi.hwid
                }
            });
        },
        async lisansMetadataGuncelle(licenseId, metadata) {
            const mevcutLisans = await db.license.findUnique({
                where: { id: licenseId },
                select: { metadata: true }
            });
            if (!mevcutLisans)
                return;
            await db.license.update({
                where: { id: licenseId },
                data: {
                    metadata: {
                        ...(mevcutLisans.metadata || {}),
                        ...metadata
                    }
                }
            });
        },
        async logOlustur(projectId, message) {
            await db.log.create({
                data: {
                    projectId,
                    message
                }
            });
        },
        async sonErisimZamaniniGuncelle(lisansId) {
            await db.license.update({
                where: {
                    id: lisansId
                },
                data: {
                    updatedAt: new Date()
                }
            });
        }
    };
}
//# sourceMappingURL=prisma-depolari.js.map