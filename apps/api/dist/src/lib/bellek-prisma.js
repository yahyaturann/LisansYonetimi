import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { apiAnahtariUret } from "../utils/api-key.js";
import { lisansAnahtariUret } from "../utils/license-key.js";
const now = new Date();
const projeId = randomUUID();
const lisansId = randomUUID();
const kullanicilar = [
    {
        id: randomUUID(),
        email: env.ADMIN_EMAIL,
        password: bcrypt.hashSync(env.ADMIN_PASSWORD, 10),
        createdAt: now
    }
];
const projeler = [
    {
        id: projeId,
        name: "Örnek SaaS Projesi",
        apiKey: apiAnahtariUret(),
        licensePrefix: "DEMO",
        settings: {
            domain_kontrol: true,
            ip_kontrol: false,
            hwid_kontrol: true,
            sure_kontrol: true,
            aktivasyon_limiti: true
        },
        createdAt: now
    }
];
const lisanslar = [
    {
        id: lisansId,
        projectId: projeId,
        licenseKey: lisansAnahtariUret("DEMO"),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        maxActivations: 3,
        metadata: {
            domain: "ornek.com"
        },
        createdAt: now,
        updatedAt: now
    }
];
const aktivasyonlar = [];
const loglar = [
    {
        id: randomUUID(),
        projectId: projeId,
        message: "Demo proje hazırlandı.",
        createdAt: now
    }
];
function siralaAzalanTarih(liste) {
    return [...liste].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
export const bellekPrisma = {
    user: {
        async findUnique({ where }) {
            return kullanicilar.find((kullanici) => kullanici.email === where.email) ?? null;
        },
        async upsert({ where, update, create }) {
            const mevcut = kullanicilar.find((kullanici) => kullanici.email === where.email);
            if (mevcut) {
                mevcut.password = update.password;
                return mevcut;
            }
            const yeniKayit = {
                id: randomUUID(),
                email: create.email,
                password: create.password,
                createdAt: new Date()
            };
            kullanicilar.push(yeniKayit);
            return yeniKayit;
        }
    },
    project: {
        async findMany() {
            return siralaAzalanTarih(projeler);
        },
        async findUnique({ where }) {
            return projeler.find((proje) => proje.id === where.id) ?? null;
        },
        async create({ data }) {
            const proje = {
                id: randomUUID(),
                name: data.name,
                apiKey: data.apiKey,
                licensePrefix: data.licensePrefix || "LIS",
                settings: data.settings,
                createdAt: new Date()
            };
            projeler.push(proje);
            return proje;
        },
        async update({ where, data }) {
            const proje = projeler.find((kayit) => kayit.id === where.id);
            if (!proje) {
                throw new Error("Proje bulunamadı.");
            }
            proje.settings = data.settings;
            return proje;
        },
        async count() {
            return projeler.length;
        }
    },
    license: {
        async create({ data }) {
            const lisans = {
                id: randomUUID(),
                projectId: data.projectId,
                licenseKey: data.licenseKey,
                expiresAt: data.expiresAt,
                maxActivations: data.maxActivations,
                metadata: data.metadata,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            lisanslar.push(lisans);
            return lisans;
        },
        async findMany({ where, include }) {
            const filtreli = lisanslar.filter((lisans) => !where?.projectId || lisans.projectId === where.projectId);
            return siralaAzalanTarih(filtreli).map((lisans) => {
                const proje = projeler.find((kayit) => kayit.id === lisans.projectId);
                const lisansAktivasyonlari = aktivasyonlar.filter((kayit) => kayit.licenseId === lisans.id);
                return {
                    ...lisans,
                    ...(include?.project
                        ? {
                            project: {
                                id: proje.id,
                                name: proje.name,
                                licensePrefix: proje.licensePrefix
                            }
                        }
                        : {}),
                    ...(include?.activations
                        ? {
                            activations: siralaAzalanTarih(lisansAktivasyonlari)
                        }
                        : {})
                };
            });
        },
        async update({ where, data }) {
            const lisans = lisanslar.find((kayit) => kayit.id === where.id);
            if (!lisans)
                throw new Error("Lisans bulunamadı.");
            lisans.metadata = { ...lisans.metadata, ...data.metadata };
            return lisans;
        },
        async delete({ where }) {
            const index = lisanslar.findIndex((lisans) => lisans.id === where.id);
            if (index === -1) {
                throw new Error("Lisans bulunamadı.");
            }
            const [silinen] = lisanslar.splice(index, 1);
            return silinen;
        },
        async findFirst({ where, include }) {
            const lisans = lisanslar.find((kayit) => kayit.projectId === where.projectId && kayit.licenseKey === where.licenseKey) ?? null;
            if (!lisans) {
                return null;
            }
            return {
                ...lisans,
                ...(include?.activations
                    ? {
                        activations: siralaAzalanTarih(aktivasyonlar.filter((aktivasyon) => aktivasyon.licenseId === lisans.id))
                    }
                    : {})
            };
        },
        async count() {
            return lisanslar.length;
        }
    },
    activation: {
        async create({ data }) {
            const aktivasyon = {
                id: randomUUID(),
                licenseId: data.licenseId,
                ip: data.ip,
                domain: data.domain,
                hwid: data.hwid,
                createdAt: new Date()
            };
            aktivasyonlar.push(aktivasyon);
            return aktivasyon;
        },
        async count() {
            return aktivasyonlar.length;
        }
    },
    log: {
        async create({ data }) {
            const log = {
                id: randomUUID(),
                projectId: data.projectId,
                message: data.message,
                createdAt: new Date()
            };
            loglar.push(log);
            return log;
        },
        async findMany({ where, include, take }) {
            const filtreli = loglar.filter((log) => !where?.projectId || log.projectId === where.projectId);
            return siralaAzalanTarih(filtreli)
                .slice(0, take ?? filtreli.length)
                .map((log) => ({
                ...log,
                ...(include?.project
                    ? {
                        project: {
                            id: log.projectId,
                            name: projeler.find((proje) => proje.id === log.projectId)?.name ?? "Bilinmeyen Proje"
                        }
                    }
                    : {})
            }));
        }
    },
    async $disconnect() { }
};
//# sourceMappingURL=bellek-prisma.js.map