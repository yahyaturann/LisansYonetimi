import { describe, expect, it, vi } from "vitest";
import { LisansDogrulamaServisi } from "./lisans-dogrulama-servisi";
function depoOlustur(ozelAlanlar = {}) {
    return {
        projeBul: vi.fn().mockResolvedValue({
            id: "proje_1",
            name: "CRM",
            apiKey: "api_anahtari",
            settings: {
                domain_kontrol: true,
                ip_kontrol: false,
                hwid_kontrol: true,
                sure_kontrol: true,
                aktivasyon_limiti: true
            }
        }),
        lisansBul: vi.fn().mockResolvedValue({
            id: "lisans_1",
            projectId: "proje_1",
            licenseKey: "LIS-TEST-1234",
            expiresAt: new Date("2030-01-01T00:00:00.000Z"),
            maxActivations: 2,
            metadata: {
                domain: "ornek.com",
                hwid: "CIHAZ-001"
            },
            activations: [
                {
                    id: "aktivasyon_1",
                    createdAt: new Date("2026-04-12T12:00:00.000Z")
                }
            ]
        }),
        aktivasyonOlustur: vi.fn().mockResolvedValue(undefined),
        logOlustur: vi.fn().mockResolvedValue(undefined),
        ...ozelAlanlar
    };
}
describe("LisansDogrulamaServisi", () => {
    it("aktif kurallar sağlandığında lisansı doğrular ve aktivasyon oluşturur", async () => {
        const depo = depoOlustur();
        const servis = new LisansDogrulamaServisi(depo);
        const sonuc = await servis.dogrula({
            projectId: "proje_1",
            apiKey: "api_anahtari",
            licenseKey: "LIS-TEST-1234",
            domain: "ornek.com",
            hwid: "CIHAZ-001",
            ip: "127.0.0.1"
        });
        expect(sonuc.success).toBe(true);
        expect(sonuc.message).toBe("Lisans doğrulandı.");
        expect(depo.aktivasyonOlustur).toHaveBeenCalledOnce();
        expect(depo.logOlustur).toHaveBeenCalledWith("proje_1", "Lisans doğrulama başarılı.");
    });
    it("domain uyuşmadığında Türkçe hata mesajı döner", async () => {
        const depo = depoOlustur();
        const servis = new LisansDogrulamaServisi(depo);
        const sonuc = await servis.dogrula({
            projectId: "proje_1",
            apiKey: "api_anahtari",
            licenseKey: "LIS-TEST-1234",
            domain: "yanlis.com",
            hwid: "CIHAZ-001"
        });
        expect(sonuc.success).toBe(false);
        expect(sonuc.message).toBe("Domain doğrulaması başarısız.");
        expect(depo.aktivasyonOlustur).not.toHaveBeenCalled();
    });
    it("aktivasyon limiti doluysa isteği reddeder", async () => {
        const depo = depoOlustur({
            lisansBul: vi.fn().mockResolvedValue({
                id: "lisans_1",
                projectId: "proje_1",
                licenseKey: "LIS-TEST-1234",
                expiresAt: new Date("2030-01-01T00:00:00.000Z"),
                maxActivations: 1,
                metadata: {
                    domain: "ornek.com",
                    hwid: "CIHAZ-001"
                },
                activations: [
                    {
                        id: "aktivasyon_1",
                        createdAt: new Date("2026-04-12T12:00:00.000Z")
                    }
                ]
            })
        });
        const servis = new LisansDogrulamaServisi(depo);
        const sonuc = await servis.dogrula({
            projectId: "proje_1",
            apiKey: "api_anahtari",
            licenseKey: "LIS-TEST-1234",
            domain: "ornek.com",
            hwid: "CIHAZ-001"
        });
        expect(sonuc.success).toBe(false);
        expect(sonuc.message).toBe("Aktivasyon limiti aşıldı.");
        expect(depo.aktivasyonOlustur).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=lisans-dogrulama-servisi.test.js.map