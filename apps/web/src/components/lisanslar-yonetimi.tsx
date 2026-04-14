"use client";

import { startTransition, useCallback, useEffect, useState } from "react";

import { kalanGunHesapla } from "../lib/bicimlendir";
import { istemciIstek } from "../lib/istemci-api";
import type { ApiYaniti, Lisans, Proje } from "../lib/turler";

type SeciliProje = "hepsi" | string;

export function LisanslarYonetimi() {
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [lisanslar, setLisanslar] = useState<Lisans[]>([]);
  const [seciliProje, setSeciliProje] = useState<SeciliProje>("hepsi");
  const [aramaMetni, setAramaMetni] = useState("");
  const [durumFiltresi, setDurumFiltresi] = useState<"hepsi" | "aktif" | "pasif">("hepsi");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [durumMesaji, setDurumMesaji] = useState<string | null>(null);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  // Form state
  const [olusturmaModu, setOlusturmaModu] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxActivations, setMaxActivations] = useState("1");
  const [domain, setDomain] = useState("");
  const [ip, setIp] = useState("");
  const [hwid, setHwid] = useState("");
  const [not, setNot] = useState("");

  const verileriYukle = useCallback(async () => {
    try {
      setYukleniyor(true);
      setDurumMesaji(null);
      setHataMesaji(null);

      const [projeYaniti, lisansYaniti] = await Promise.all([
        istemciIstek<ApiYaniti<Proje[]>>("/api/panel/projeler"),
        istemciIstek<ApiYaniti<Lisans[]>>("/api/panel/lisanslar")
      ]);

      setProjeler(projeYaniti.data);
      setLisanslar(lisansYaniti.data);
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Lisans verileri alınamadı.");
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void verileriYukle();
  }, [verileriYukle]);

  // Filtrelenmiş lisanslar
  const filtrelenmisLisanslar = lisanslar.filter((lisans) => {
    // Proje filtresi
    if (seciliProje !== "hepsi" && lisans.project.id !== seciliProje) {
      return false;
    }

    // Arama filtresi (lisans anahtarı veya not)
    if (aramaMetni) {
      const arama = aramaMetni.toLowerCase();
      const licenseKey_eslesme = lisans.licenseKey.toLowerCase().includes(arama);
      const projeAdi_eslesme = lisans.project.name.toLowerCase().includes(arama);
      if (!licenseKey_eslesme && !projeAdi_eslesme) {
        return false;
      }
    }

    // Durum filtresi
    if (durumFiltresi !== "hepsi") {
      const suan = Date.now();
      const bitisTarihi = lisans.expiresAt ? new Date(lisans.expiresAt).getTime() : null;
      const aktifMi = !bitisTarihi || bitisTarihi > suan;

      if (durumFiltresi === "aktif" && !aktifMi) return false;
      if (durumFiltresi === "pasif" && aktifMi) return false;
    }

    return true;
  });

  // Her proje için lisans sayısı
  const projeLisansSayilari = projeler.reduce((acc, proje) => {
    acc[proje.id] = lisanslar.filter((l) => l.project.id === proje.id).length;
    return acc;
  }, {} as Record<string, number>);

  async function lisansOlustur(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDurumMesaji(null);
    setHataMesaji(null);

    try {
      await istemciIstek<ApiYaniti<Lisans>>("/api/panel/lisanslar", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          max_activations: maxActivations ? Number(maxActivations) : null,
          metadata: {
            domain: domain || null,
            ip: ip || null,
            hwid: hwid || null,
            not: not || undefined
          }
        })
      });

      setDurumMesaji("Lisans oluşturuldu.");
      setOlusturmaModu(false);
      setExpiresAt("");
      setMaxActivations("1");
      setDomain("");
      setIp("");
      setHwid("");
      setNot("");
      startTransition(() => {
        void verileriYukle();
      });
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Lisans oluşturulamadı.");
    }
  }

  async function lisansiSil(id: string) {
    if (!confirm("Bu lisansı silmek istediğine emin misin?")) return;

    setDurumMesaji(null);
    setHataMesaji(null);

    try {
      await istemciIstek<ApiYaniti<null>>(`/api/panel/lisanslar/${id}`, {
        method: "DELETE"
      });

      setDurumMesaji("Lisans silindi.");
      startTransition(() => {
        void verileriYukle();
      });
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Lisans silinemedi.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Üst Bar - Arama ve Filtreler */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Lisans anahtarı veya proje ara..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Durum Filtresi */}
          <select
            value={durumFiltresi}
            onChange={(e) => setDurumFiltresi(e.target.value as "hepsi" | "aktif" | "pasif")}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
          >
            <option value="hepsi">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>

          {/* Yeni Lisans Butonu */}
          <button
            onClick={() => setOlusturmaModu(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Lisans
          </button>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sol Panel - Proje Listesi */}
        <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 px-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Projeler
          </h3>

          <div className="space-y-1">
            {/* Tümü Seçeneği */}
            <button
              onClick={() => setSeciliProje("hepsi")}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                seciliProje === "hepsi"
                  ? "bg-slate-950 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="font-medium">Tüm Projeler</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  seciliProje === "hepsi"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {lisanslar.length}
              </span>
            </button>

            {/* Proje Listesi */}
            {projeler.map((proje) => (
              <button
                key={proje.id}
                onClick={() => setSeciliProje(proje.id)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                  seciliProje === proje.id
                    ? "bg-amber-50 text-amber-900"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      seciliProje === proje.id ? "bg-amber-500" : "bg-slate-300"
                    }`}
                  />
                  <span className="truncate font-medium">{proje.name}</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    seciliProje === proje.id
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {projeLisansSayilari[proje.id] || 0}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Sağ Panel - Lisans Listesi */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          {/* Başlık */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                {seciliProje === "hepsi"
                  ? "Tüm Lisanslar"
                  : projeler.find((p) => p.id === seciliProje)?.name || "Lisanslar"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {filtrelenmisLisanslar.length} lisans bulundu
              </p>
            </div>
          </div>

          {/* Mesajlar */}
          {durumMesaji && (
            <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {durumMesaji}
            </div>
          )}

          {hataMesaji && (
            <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {hataMesaji}
            </div>
          )}

          {/* Yükleniyor */}
          {yukleniyor && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500" />
            </div>
          )}

          {/* Lisans Listesi */}
          {!yukleniyor && (
            <div className="space-y-3">
              {filtrelenmisLisanslar.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-slate-600">
                    {aramaMetni || durumFiltresi !== "hepsi"
                      ? "Arama kriterlerine uygun lisans bulunamadı."
                      : "Henüz lisans yok."}
                  </p>
                </div>
              ) : (
                filtrelenmisLisanslar.map((lisans) => {
                  const suan = Date.now();
                  const bitisTarihi = lisans.expiresAt
                    ? new Date(lisans.expiresAt).getTime()
                    : null;
                  const aktifMi = !bitisTarihi || bitisTarihi > suan;
                  const suanBitmisMi = bitisTarihi && bitisTarihi <= suan;

                  return (
                    <article
                      key={lisans.id}
                      className={`rounded-xl border p-4 transition ${
                        suanBitmisMi
                          ? "border-rose-200 bg-rose-50/50"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Üst Satır - Proje ve Lisans Anahtarı */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                              {lisans.project.name}
                            </span>
                            <code className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-semibold text-amber-300">
                              {lisans.licenseKey}
                            </code>
                            {suanBitmisMi ? (
                              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                                Süresi Dolmuş
                              </span>
                            ) : aktifMi ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                Aktif
                              </span>
                            ) : null}
                          </div>

                          {/* Detaylar */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-slate-600">
                            {(() => {
                              const kalan = kalanGunHesapla(lisans.expiresAt);
                              return (
                                <span>
                                  <span className="font-medium text-slate-500">Kalan:</span>{" "}
                                  <span className={kalan.renk}>{kalan.text}</span>
                                </span>
                              );
                            })()}
                            <span>
                              <span className="font-medium text-slate-500">Aktivasyon:</span>{" "}
                              {lisans.activations.length}
                              {lisans.maxActivations ? `/${lisans.maxActivations}` : ""}
                            </span>
                            <span>
                              <span className="font-medium text-slate-500">Aktivasyon:</span>{" "}
                              {lisans.activations.length}
                              {lisans.maxActivations ? `/${lisans.maxActivations}` : ""}
                            </span>
                            {lisans.metadata?.domain && (
                              <span>
                                <span className="font-medium text-slate-500">Domain:</span>{" "}
                                {lisans.metadata.domain}
                              </span>
                            )}
                            {lisans.metadata?.ip && (
                              <span>
                                <span className="font-medium text-slate-500">IP:</span>{" "}
                                {lisans.metadata.ip}
                              </span>
                            )}
                          </div>

                        </div>

                        {/* İşlemler */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void lisansiSil(lisans.id)}
                            className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>

      {/* Lisans Oluşturma Modal */}
      {olusturmaModu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setOlusturmaModu(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-semibold text-slate-900">Yeni Lisans Oluştur</h3>

            <form onSubmit={lisansOlustur} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Proje</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                >
                  <option value="">Proje seçin</option>
                  {projeler.map((proje) => (
                    <option key={proje.id} value={proje.id}>
                      {proje.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Bitiş Tarihi</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Maksimum Aktivasyon</label>
                <input
                  type="number"
                  value={maxActivations}
                  onChange={(e) => setMaxActivations(e.target.value)}
                  min="1"
                  placeholder="Sınırsız bırakmak için boş bırakın"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Domain (opsiyonel)</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="ornek.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">IP (opsiyonel)</label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="127.0.0.1"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">HWID (opsiyonel)</label>
                <input
                  type="text"
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                  placeholder="PC-001"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Not (opsiyonel)</label>
                <input
                  type="text"
                  value={not}
                  onChange={(e) => setNot(e.target.value)}
                  placeholder="Müşteri notu..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOlusturmaModu(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
