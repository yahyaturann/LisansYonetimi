import type { PrismaClient } from "@prisma/client";

import { varsayilanProjeAyarlari, type ProjeAyarlari } from "../types/domain.js";
import { apiAnahtariUret } from "../utils/api-key.js";
import { LogServisi } from "./log-servisi.js";

export class ProjeServisi {
  private readonly logServisi: LogServisi;

  constructor(private readonly db: PrismaClient) {
    this.logServisi = new LogServisi(db);
  }

  async listele() {
    return this.db.project.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async bul(projectId: string) {
    return this.db.project.findUnique({
      where: {
        id: projectId
      }
    });
  }

  async olustur(name: string, settings?: Partial<ProjeAyarlari>, licensePrefix?: string) {
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

  async ayarlariGuncelle(projectId: string, settings: Partial<ProjeAyarlari>) {
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
