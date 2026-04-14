import type { DogrulamaSonucu, LisansMetaVerisi, ProjeAyarlari } from "../types/domain.js";

type AktivasyonOzeti = {
  id: string;
  createdAt: Date;
};

type ProjeKaydi = {
  id: string;
  name: string;
  apiKey: string;
  settings: ProjeAyarlari;
};

type LisansKaydi = {
  id: string;
  projectId: string;
  licenseKey: string;
  expiresAt: Date | null;
  maxActivations: number | null;
  metadata: LisansMetaVerisi;
  activations: AktivasyonOzeti[];
};

export interface LisansDogrulamaDeposu {
  projeBul(projectId: string): Promise<ProjeKaydi | null>;
  lisansBul(projectId: string, licenseKey: string): Promise<LisansKaydi | null>;
  aktivasyonOlustur(girdi: {
    licenseId: string;
    ip?: string;
    domain?: string;
    hwid?: string;
  }): Promise<void>;
  lisansMetadataGuncelle(licenseId: string, metadata: Partial<LisansMetaVerisi>): Promise<void>;
  logOlustur(projectId: string, message: string): Promise<void>;
  sonErisimZamaniniGuncelle(lisansId: string): Promise<void>;
}

type DogrulamaGirdisi = {
  projectId: string;
  apiKey: string;
  licenseKey: string;
  domain?: string;
  ip?: string;
  hwid?: string;
};

export class LisansDogrulamaServisi {
  constructor(private readonly depo: LisansDogrulamaDeposu) {}

  async dogrula(girdi: DogrulamaGirdisi): Promise<DogrulamaSonucu> {
    const proje = await this.depo.projeBul(girdi.projectId);

    if (!proje) {
      await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: Proje bulunamadı.");
      return {
        success: false,
        message: "Proje bulunamadı.",
        expiresAt: null,
        remainingActivations: null
      };
    }

    if (proje.apiKey !== girdi.apiKey) {
      await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: API anahtarı uyuşmuyor.");
      return {
        success: false,
        message: "API anahtarı uyuşmuyor.",
        expiresAt: null,
        remainingActivations: null
      };
    }

    const lisans = await this.depo.lisansBul(girdi.projectId, girdi.licenseKey);

    if (!lisans) {
      await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: Lisans bulunamadı.");
      return {
        success: false,
        message: "Lisans bulunamadı.",
        expiresAt: null,
        remainingActivations: null
      };
    }

    // Süre kontrolü
    if (proje.settings.sure_kontrol) {
      if (!lisans.expiresAt) {
        await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: Süre kontrolü aktif ama süre tanımsız.");
        return {
          success: false,
          message: "Lisans süresi dolmuş.",
          expiresAt: null,
          remainingActivations: null
        };
      }

      if (lisans.expiresAt.getTime() < Date.now()) {
        await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: Süresi dolmuş.");
        return {
          success: false,
          message: "Lisans süresi dolmuş.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }
    }

    // Aktivasyon limiti kontrolü
    if (proje.settings.aktivasyon_limiti && lisans.maxActivations !== null) {
      const aktifActivasyonSayisi = lisans.activations.length;

      if (aktifActivasyonSayisi >= lisans.maxActivations) {
        await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: Aktivasyon limiti doldu.");
        return {
          success: false,
          message: "Aktivasyon limiti doldu.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }
    }

    // Domain kontrolü
    if (proje.settings.domain_kontrol) {
      if (!lisans.metadata.domain || !girdi.domain) {
        await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: Domain kontrolü aktif ama alan tanımsız.");
        return {
          success: false,
          message: "Domain doğrulaması başarısız.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }

      if (lisans.metadata.domain !== girdi.domain) {
        await this.depo.logOlustur(
          girdi.projectId,
          `Lisans doğrulama başarısız: Domain uyuşmuyor. ${lisans.metadata.domain} !== ${girdi.domain}`
        );
        return {
          success: false,
          message: "Domain uyuşmuyor.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }
    }

    // IP kontrolü - otomatik kaydetme veya doğrulama
    if (proje.settings.ip_kontrol) {
      if (!girdi.ip) {
        await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: IP gönderilmedi.");
        return {
          success: false,
          message: "IP adresi gönderilmedi.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }

      // İlk aktivasyon ise IP'yi kaydet
      if (!lisans.metadata.ip) {
        await this.depo.lisansMetadataGuncelle(lisans.id, { ip: girdi.ip });
        await this.depo.logOlustur(girdi.projectId, `Lisans IP adresi kaydedildi: ${girdi.ip}`);
      } else if (lisans.metadata.ip !== girdi.ip) {
        // Sonraki aktivasyonlarda doğrula
        await this.depo.logOlustur(
          girdi.projectId,
          `Lisans doğrulama başarısız: IP uyuşmuyor. ${lisans.metadata.ip} !== ${girdi.ip}`
        );
        return {
          success: false,
          message: "IP uyuşmuyor.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }
    }

    // HWID kontrolü - otomatik kaydetme veya doğrulama
    if (proje.settings.hwid_kontrol) {
      if (!girdi.hwid) {
        await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarısız: HWID gönderilmedi.");
        return {
          success: false,
          message: "HWID gönderilmedi.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }

      // İlk aktivasyon ise HWID'yi kaydet
      if (!lisans.metadata.hwid) {
        await this.depo.lisansMetadataGuncelle(lisans.id, { hwid: girdi.hwid });
        await this.depo.logOlustur(girdi.projectId, `Lisans HWID kaydedildi: ${girdi.hwid}`);
      } else if (lisans.metadata.hwid !== girdi.hwid) {
        // Sonraki aktivasyonlarda doğrula
        await this.depo.logOlustur(
          girdi.projectId,
          `Lisans doğrulama başarısız: HWID uyuşmuyor. ${lisans.metadata.hwid} !== ${girdi.hwid}`
        );
        return {
          success: false,
          message: "HWID uyuşmuyor.",
          expiresAt: lisans.expiresAt,
          remainingActivations: null
        };
      }
    }

    // Başarılı doğrulama - aktivasyon kaydı oluştur
    await this.depo.aktivasyonOlustur({
      licenseId: lisans.id,
      ip: girdi.ip,
      domain: girdi.domain,
      hwid: girdi.hwid
    });

    await this.depo.logOlustur(girdi.projectId, "Lisans doğrulama başarılı.");
    await this.depo.sonErisimZamaniniGuncelle(lisans.id);

    const kalanActivasyonlar = lisans.maxActivations
      ? lisans.maxActivations - lisans.activations.length
      : null;

    return {
      success: true,
      message: "Lisans geçerli",
      expiresAt: lisans.expiresAt,
      remainingActivations: kalanActivasyonlar
    };
  }
}
