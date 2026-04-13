import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

import { env } from "../config/env.js";
import { apiAnahtariUret } from "../utils/api-key.js";
import { lisansAnahtariUret } from "../utils/license-key.js";

type Kullanici = {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
};

type Proje = {
  id: string;
  name: string;
  apiKey: string;
  licensePrefix: string;
  settings: Record<string, unknown>;
  createdAt: Date;
};

type Lisans = {
  id: string;
  projectId: string;
  licenseKey: string;
  expiresAt: Date | null;
  maxActivations: number | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

type Aktivasyon = {
  id: string;
  licenseId: string;
  ip?: string;
  domain?: string;
  hwid?: string;
  createdAt: Date;
};

type Log = {
  id: string;
  projectId: string;
  message: string;
  createdAt: Date;
};

const now = new Date();
const projeId = randomUUID();
const lisansId = randomUUID();

const kullanicilar: Kullanici[] = [
  {
    id: randomUUID(),
    email: env.ADMIN_EMAIL,
    password: bcrypt.hashSync(env.ADMIN_PASSWORD, 10),
    createdAt: now
  }
];

const projeler: Proje[] = [
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

const lisanslar: Lisans[] = [
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

const aktivasyonlar: Aktivasyon[] = [];

const loglar: Log[] = [
  {
    id: randomUUID(),
    projectId: projeId,
    message: "Demo proje hazırlandı.",
    createdAt: now
  }
];

function siralaAzalanTarih<T extends { createdAt: Date }>(liste: T[]) {
  return [...liste].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const bellekPrisma = {
  user: {
    async findUnique({ where }: { where: { email: string } }) {
      return kullanicilar.find((kullanici) => kullanici.email === where.email) ?? null;
    },
    async upsert({
      where,
      update,
      create
    }: {
      where: { email: string };
      update: { password: string };
      create: { email: string; password: string };
    }) {
      const mevcut = kullanicilar.find((kullanici) => kullanici.email === where.email);

      if (mevcut) {
        mevcut.password = update.password;
        return mevcut;
      }

      const yeniKayit: Kullanici = {
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
    async findUnique({ where }: { where: { id: string } }) {
      return projeler.find((proje) => proje.id === where.id) ?? null;
    },
    async create({
      data
    }: {
      data: { name: string; apiKey: string; licensePrefix?: string; settings: Record<string, unknown> };
    }) {
      const proje: Proje = {
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
    async update({
      where,
      data
    }: {
      where: { id: string };
      data: { settings: Record<string, unknown> };
    }) {
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
    async create({
      data
    }: {
      data: {
        projectId: string;
        licenseKey: string;
        expiresAt: Date | null;
        maxActivations: number | null;
        metadata: Record<string, unknown>;
      };
    }) {
      const lisans: Lisans = {
        id: randomUUID(),
        projectId: data.projectId,
        licenseKey: data.licenseKey,
        expiresAt: data.expiresAt,
        maxActivations: data.maxActivations,
        metadata: data.metadata,
        createdAt: new Date()
      };

      lisanslar.push(lisans);
      return lisans;
    },
    async findMany({ where, include }: { where?: { projectId?: string }; include?: Record<string, unknown> }) {
      const filtreli = lisanslar.filter((lisans) => !where?.projectId || lisans.projectId === where.projectId);

      return siralaAzalanTarih(filtreli).map((lisans) => {
        const proje = projeler.find((kayit) => kayit.id === lisans.projectId)!;
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
    async update({ where, data }: { where: { id: string }; data: { metadata: Record<string, unknown> } }) {
      const lisans = lisanslar.find((kayit) => kayit.id === where.id);
      if (!lisans) throw new Error("Lisans bulunamadı.");
      lisans.metadata = { ...lisans.metadata, ...data.metadata };
      return lisans;
    },
    async delete({ where }: { where: { id: string } }) {
      const index = lisanslar.findIndex((lisans) => lisans.id === where.id);

      if (index === -1) {
        throw new Error("Lisans bulunamadı.");
      }

      const [silinen] = lisanslar.splice(index, 1);
      return silinen;
    },
    async findFirst({
      where,
      include
    }: {
      where: { projectId: string; licenseKey: string };
      include?: Record<string, unknown>;
    }) {
      const lisans =
        lisanslar.find(
          (kayit) => kayit.projectId === where.projectId && kayit.licenseKey === where.licenseKey
        ) ?? null;

      if (!lisans) {
        return null;
      }

      return {
        ...lisans,
        ...(include?.activations
          ? {
              activations: siralaAzalanTarih(
                aktivasyonlar.filter((aktivasyon) => aktivasyon.licenseId === lisans.id)
              )
            }
          : {})
      };
    },
    async count() {
      return lisanslar.length;
    }
  },
  activation: {
    async create({
      data
    }: {
      data: { licenseId: string; ip?: string; domain?: string; hwid?: string };
    }) {
      const aktivasyon: Aktivasyon = {
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
    async create({ data }: { data: { projectId: string; message: string } }) {
      const log: Log = {
        id: randomUUID(),
        projectId: data.projectId,
        message: data.message,
        createdAt: new Date()
      };

      loglar.push(log);
      return log;
    },
    async findMany({
      where,
      include,
      take
    }: {
      where?: { projectId?: string };
      include?: Record<string, unknown>;
      take?: number;
    }) {
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
  async $disconnect() {}
};
