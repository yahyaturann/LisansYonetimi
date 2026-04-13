"use client";

import { useEffect, useState } from "react";

import { istemciIstek } from "../lib/istemci-api";
import type { ApiYaniti, Lisans } from "../lib/turler";

interface LisansOlusturModalProps {
  projeId: string;
  projeAdi: string;
  projeAyarlari: {
    domain_kontrol: boolean;
    ip_kontrol: boolean;
    hwid_kontrol: boolean;
    sure_kontrol: boolean;
    aktivasyon_limiti: boolean;
  };
  mevcutLisanslar: Lisans[];
  onLisansOlusturuldu: () => void;
  onClose: () => void;
}

const GUN_SECENEKLERI = [
  { label: "30 Gün", gun: 30 },
  { label: "60 Gün", gun: 60 },
  { label: "90 Gün", gun: 90 },
  { label: "180 Gün", gun: 180 },
  { label: "365 Gün", gun: 365 },
  { label: "Sınırsız", gun: 0 }
];

export function LisansOlusturModal({
  projeId,
  projeAdi,
  projeAyarlari,
  onLisansOlusturuldu,
  onClose
}: LisansOlusturModalProps) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  // Form state
  const [lisansKey, setLisansKey] = useState("");
  const [seciliGun, setSeciliGun] = useState<number>(90);
  const [maxActivations, setMaxActivations] = useState<string>("1");
  const [not, setNot] = useState("");
  const [domain, setDomain] = useState("");
  const [ip, setIp] = useState("");
  const [hwid, setHwid] = useState("");

  // Lisans key üret
  useEffect(() => {
    const randomKey = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X").substring(0, 4);
    const randomKey2 = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X").substring(0, 4);
    const randomKey3 = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X").substring(0, 4);
    setLisansKey(`${randomKey}-${randomKey2}-${randomKey3}`);
  }, []);

  const expiresAtHesapla = (): Date | null => {
    if (seciliGun === 0) return null;
    const tarih = new Date();
    tarih.setDate(tarih.getDate() + seciliGun);
    return tarih;
  };

  const lisansiOlustur = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHata(null);
    setBasari(null);

    try {
      setYukleniyor(true);

      const expiresAt = expiresAtHesapla();

      const veri = {
        project_id: projeId,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        max_activations: maxActivations ? Number(maxActivations) : null,
        metadata: {
          domain: projeAyarlari.domain_kontrol ? domain : null,
          ip: projeAyarlari.ip_kontrol ? ip : null,
          hwid: projeAyarlari.hwid_kontrol ? hwid : null,
          not: not || undefined
        }
      };

      await istemciIstek<ApiYaniti<Lisans>>(`/api/panel/projeler/${projeId}/lisanslar`, {
        method: "POST",
        body: JSON.stringify(veri)
      });

      setBasari("Lisans oluşturuldu.");
      setNot("");
      setDomain("");
      setIp("");
      setHwid("");

      setTimeout(() => {
        onLisansOlusturuldu();
        onClose();
      }, 1500);
    } catch (hata) {
      setHata(hata instanceof Error ? hata.message : "Lisans oluşturulamadı.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-semibold text-slate-900">Yeni Lisans Oluştur</h3>
        <p className="mt-1 text-sm text-slate-600">
          Proje: {projeAdi}
        </p>

        {basari && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {basari}
          </div>
        )}

        {hata && (
          <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {hata}
          </div>
        )}

        <form onSubmit={lisansiOlustur} className="mt-6 space-y-5">
          {/* Lisans Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Lisans Anahtarı
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={lisansKey}
                readOnly
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600"
              />
              <button
                type="button"
                onClick={() => {
                  const randomKey = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X").substring(0, 4);
                  const randomKey2 = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X").substring(0, 4);
                  const randomKey3 = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X").substring(0, 4);
                  setLisansKey(`${randomKey}-${randomKey2}-${randomKey3}`);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Yenile
              </button>
            </div>
          </div>

          {/* Not */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Not (opsiyonel)
            </label>
            <input
              type="text"
              value={not}
              onChange={(event) => setNot(event.target.value)}
              placeholder="Müşteri notu..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
            />
          </div>

          {/* Süre - Gün Seçenekleri */}
          {projeAyarlari.sure_kontrol && (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Geçerlilik Süresi
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {GUN_SECENEKLERI.map((secenek) => (
                  <button
                    key={secenek.gun}
                    type="button"
                    onClick={() => setSeciliGun(secenek.gun)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      seciliGun === secenek.gun
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {secenek.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Maksimum Aktivasyon */}
          {projeAyarlari.aktivasyon_limiti && (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Maksimum Aktivasyon
              </label>
              <input
                type="number"
                value={maxActivations}
                onChange={(event) => setMaxActivations(event.target.value)}
                min="1"
                placeholder="1"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
              />
            </div>
          )}

          {/* Domain - Manuel */}
          {projeAyarlari.domain_kontrol && (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="ornek.com"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
              />
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={yukleniyor}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={yukleniyor}
              className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {yukleniyor ? "Oluşturuluyor..." : "Lisans Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
