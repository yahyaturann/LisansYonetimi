"use client";

import { useCallback, useEffect, useState } from "react";

import { istemciIstek } from "../lib/istemci-api";
import type { ApiYaniti, Lisans, Proje, ProjeAyarlari } from "../lib/turler";

const varsayilanAyarlar: ProjeAyarlari = {
  domain_kontrol: false,
  ip_kontrol: false,
  hwid_kontrol: false,
  sure_kontrol: false,
  aktivasyon_limiti: false
};

const GUN_SECENEKLERI = [
  { label: "30 Gün", gun: 30 },
  { label: "60 Gün", gun: 60 },
  { label: "90 Gün", gun: 90 },
  { label: "180 Gün", gun: 180 },
  { label: "365 Gün", gun: 365 },
  { label: "Sınırsız", gun: 0 }
];

function KopyalaButonu({ metin }: { metin: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      onClick={kopyala}
      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
        kopyalandi
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {kopyalandi ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Kopyalandı
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Kopyala
        </>
      )}
    </button>
  );
}

export function ProjelerYonetimi() {
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [yeniProjeAdi, setYeniProjeAdi] = useState("");
  const [lisansPrefix, setLisansPrefix] = useState("LIS");
  const [olusturmaAyarlari, setOlusturmaAyarlari] = useState<ProjeAyarlari>(varsayilanAyarlar);
  const [durumMesaji, setDurumMesaji] = useState<string | null>(null);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  // Duzenleme modalı
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [seciliProje, setSeciliProje] = useState<Proje | null>(null);
  const [projeLisanslari, setProjeLisanslari] = useState<Lisans[]>([]);

  // Yeni lisans formu
  const [seciliGun, setSeciliGun] = useState(90);
  const [maxActivations, setMaxActivations] = useState("1");
  const [domain, setDomain] = useState("");
  const [not, setNot] = useState("");

  const verileriYukle = useCallback(async () => {
    try {
      const yanit = await istemciIstek<ApiYaniti<Proje[]>>("/api/panel/projeler");
      setProjeler(yanit.data);
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Projeler alınamadı.");
    }
  }, []);

  useEffect(() => {
    void verileriYukle();
  }, [verileriYukle]);

  function ayarDegistir(ayar: keyof ProjeAyarlari, deger: boolean) {
    setOlusturmaAyarlari((onceki) => ({
      ...onceki,
      [ayar]: deger
    }));
  }

  async function projeOlustur(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDurumMesaji(null);
    setHataMesaji(null);

    if (!lisansPrefix.match(/^[A-Z0-9]+$/)) {
      setHataMesaji("Lisans öneki sadece büyük harf ve rakam içerebilir.");
      return;
    }

    try {
      await istemciIstek<ApiYaniti<Proje>>("/api/panel/projeler", {
        method: "POST",
        body: JSON.stringify({
          name: yeniProjeAdi,
          settings: olusturmaAyarlari,
          license_prefix: lisansPrefix
        })
      });

      setYeniProjeAdi("");
      setLisansPrefix("LIS");
      setOlusturmaAyarlari(varsayilanAyarlar);
      setDurumMesaji("Proje oluşturuldu.");
      void verileriYukle();
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Proje oluşturulamadı.");
    }
  }

  async function projeAyariGuncelle(proje: Proje, ayar: keyof ProjeAyarlari, deger: boolean) {
    setHataMesaji(null);

    try {
      await istemciIstek<ApiYaniti<Proje>>(`/api/panel/projeler/${proje.id}/settings`, {
        method: "PATCH",
        body: JSON.stringify({
          settings: {
            ...(proje.settings ?? varsayilanAyarlar),
            [ayar]: deger
          }
        })
      });

      setDurumMesaji(`${proje.name} ayarları güncellendi.`);
      void verileriYukle();
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Ayar güncellenemedi.");
    }
  }

  // Duzenleme modalı ac
  const duzenlemeAc = async (proje: Proje) => {
    setSeciliProje(proje);
    setDuzenlemeModu(true);
    setHataMesaji(null);
    setDurumMesaji(null);

    // Lisanslari yukle
    try {
      const yanit = await istemciIstek<ApiYaniti<Lisans[]>>(`/api/panel/projeler/${proje.id}/lisanslar`);
      setProjeLisanslari(yanit.data);
    } catch {
      setProjeLisanslari([]);
    }
  };

  const duzenlemeKapat = () => {
    setDuzenlemeModu(false);
    setSeciliProje(null);
    setProjeLisanslari([]);
    setDomain("");
    setNot("");
    setMaxActivations("1");
    setSeciliGun(90);
  };

  // Lisans olustur
  async function lisansOlustur(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seciliProje) return;

    setHataMesaji(null);

    try {
      const expiresAt = seciliGun === 0 ? null : new Date(Date.now() + seciliGun * 24 * 60 * 60 * 1000).toISOString();

      await istemciIstek<ApiYaniti<Lisans>>(`/api/panel/projeler/${seciliProje.id}/lisanslar`, {
        method: "POST",
        body: JSON.stringify({
          project_id: seciliProje.id,
          expires_at: expiresAt,
          max_activations: maxActivations ? Number(maxActivations) : null,
          metadata: {
            domain: domain || null,
            not: not || undefined
          }
        })
      });

      setDurumMesaji("Lisans oluşturuldu.");
      setDomain("");
      setNot("");
      setMaxActivations("1");

      // Lisanslari yenile
      const yanit = await istemciIstek<ApiYaniti<Lisans[]>>(`/api/panel/projeler/${seciliProje.id}/lisanslar`);
      setProjeLisanslari(yanit.data);
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Lisans oluşturulamadı.");
    }
  }

  // Lisans sil
  async function lisansSil(lisansId: string) {
    if (!confirm("Bu lisansı silmek istediğine emin misin?")) return;
    if (!seciliProje) return;

    setHataMesaji(null);

    try {
      await istemciIstek<ApiYaniti<null>>(`/api/panel/lisanslar/${lisansId}`, {
        method: "DELETE"
      });

      setDurumMesaji("Lisans silindi.");

      // Lisanslari yenile
      const yanit = await istemciIstek<ApiYaniti<Lisans[]>>(`/api/panel/projeler/${seciliProje.id}/lisanslar`);
      setProjeLisanslari(yanit.data);
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Lisans silinemedi.");
    }
  }

  const ayarEtiketleri: Record<keyof ProjeAyarlari, { etiket: string; aciklama: string }> = {
    domain_kontrol: { etiket: "Domain", aciklama: "Lisans domain ile sınırlı" },
    ip_kontrol: { etiket: "IP", aciklama: "IP otomatik kaydedilir" },
    hwid_kontrol: { etiket: "HWID", aciklama: "Bilgisayar otomatik kaydedilir" },
    sure_kontrol: { etiket: "Süre", aciklama: "Bitiş tarihi kontrolü" },
    aktivasyon_limiti: { etiket: "Limit", aciklama: "Maksimum aktivasyon" }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* Sol Panel - Proje Oluşturma */}
        <form onSubmit={projeOlustur} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Yeni Proje Oluştur</h3>

          {durumMesaji && (
            <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              {durumMesaji}
            </div>
          )}

          {hataMesaji && (
            <div className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
              {hataMesaji}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Proje Adı</label>
              <input
                value={yeniProjeAdi}
                onChange={(event) => setYeniProjeAdi(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                placeholder="Örn: CRM Sunucusu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Lisans Öneki</label>
              <input
                value={lisansPrefix}
                onChange={(event) => setLisansPrefix(event.target.value.toUpperCase())}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono outline-none transition focus:border-amber-500"
                placeholder="Örn: CRM"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Doğrulama Ayarları</p>
              <div className="grid gap-2">
                {Object.entries(ayarEtiketleri).map(([anahtar, { etiket }]) => {
                  const ayarAnahtari = anahtar as keyof ProjeAyarlari;
                  return (
                    <label key={anahtar} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition">
                      <span className="font-medium text-slate-700">{etiket}</span>
                      <input
                        checked={olusturmaAyarlari[ayarAnahtari]}
                        onChange={(event) => ayarDegistir(ayarAnahtari, event.target.checked)}
                        type="checkbox"
                        className="h-5 w-5 accent-amber-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <button className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Projeyi Oluştur
          </button>
        </form>

        {/* Sağ Panel - Proje Listesi */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-950">Projeler</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {projeler.length} proje
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {projeler.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">Henüz proje bulunmuyor.</p>
              </div>
            ) : (
              projeler.map((proje) => {
                const aktifAyarlar = Object.entries(proje.settings ?? {})
                  .filter(([, deger]) => deger === true)
                  .map(([anahtar]) => anahtar as keyof ProjeAyarlari);

                return (
                  <article key={proje.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="text-base font-semibold text-slate-900">{proje.name}</h4>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                            {proje.licensePrefix || "LIS"}
                          </span>
                          <button
                            onClick={() => duzenlemeAc(proje)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            Düzenle
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-xs text-slate-400 shrink-0">API:</span>
                            <code className="rounded bg-slate-950 px-1.5 py-0.5 text-xs text-amber-300 truncate">
                              {proje.apiKey}
                            </code>
                          </div>
                          <KopyalaButonu metin={proje.apiKey} />
                        </div>

                        {aktifAyarlar.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {aktifAyarlar.map((ayar) => (
                              <span key={ayar} className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {ayarEtiketleri[ayar]?.etiket || ayar}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Doğrulama ayarı yok</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </section>

      {/* Duzenleme Modalı */}
      {duzenlemeModu && seciliProje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl">
            <button
              onClick={duzenlemeKapat}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-semibold text-slate-900">Projeyi Düzenle</h3>
            <p className="mt-1 text-sm text-slate-600">{seciliProje.name}</p>

            {durumMesaji && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                {durumMesaji}
              </div>
            )}

            {hataMesaji && (
              <div className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                {hataMesaji}
              </div>
            )}

            {/* Ayarlar */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Doğrulama Ayarları</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ayarEtiketleri).map(([anahtar, { etiket }]) => {
                  const ayarAnahtari = anahtar as keyof ProjeAyarlari;
                  return (
                    <label key={anahtar} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        checked={seciliProje.settings?.[ayarAnahtari] ?? false}
                        onChange={(event) => projeAyariGuncelle(seciliProje, ayarAnahtari, event.target.checked)}
                        type="checkbox"
                        className="h-4 w-4 accent-amber-500"
                      />
                      <span className="text-sm text-slate-700">{etiket}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Lisans Olustur */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Yeni Lisans Oluştur</p>
              <form onSubmit={lisansOlustur} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {GUN_SECENEKLERI.map((secenek) => (
                    <button
                      key={secenek.gun}
                      type="button"
                      onClick={() => setSeciliGun(secenek.gun)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        seciliGun === secenek.gun
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {secenek.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={not}
                    onChange={(e) => setNot(e.target.value)}
                    placeholder="Not (opsiyonel)"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-amber-500"
                  />
                  <button type="submit" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Lisans Oluştur
                  </button>
                </div>
              </form>
            </div>

            {/* Lisanslar */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Lisanslar ({projeLisanslari.length})</p>
              {projeLisanslari.length === 0 ? (
                <p className="text-sm text-slate-500">Bu proje için lisans yok.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {projeLisanslari.map((lisans) => {
                    const bitis = lisans.expiresAt ? new Date(lisans.expiresAt).getTime() : null;
                    const kaldi = bitis ? Math.ceil((bitis - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                    const aktif = !bitis || bitis > Date.now();

                    return (
                      <div key={lisans.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-amber-300">{lisans.licenseKey}</code>
                          <span className={`text-xs ${aktif ? "text-emerald-600" : "text-rose-600"}`}>
                            {kaldi !== null ? (kaldi > 0 ? `${kaldi} gün kaldı` : `${Math.abs(kaldi)} gün geçmiş`) : "Sınırsız"}
                          </span>
                        </div>
                        <button
                          onClick={() => lisansSil(lisans.id)}
                          className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          Sil
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
