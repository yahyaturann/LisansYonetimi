"use client";

import { useCallback, useEffect, useState } from "react";

import { tarihBicimlendir } from "../lib/bicimlendir";
import { istemciIstek } from "../lib/istemci-api";
import type { ApiYaniti, DashboardOzeti } from "../lib/turler";

export function DashboardOzetiBileseni() {
  const [veri, setVeri] = useState<DashboardOzeti | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const veriyiYukle = useCallback(async () => {
    try {
      const yanit = await istemciIstek<ApiYaniti<DashboardOzeti>>("/api/panel/ozet");
      setVeri(yanit.data);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Özet verileri alınamadı.");
    }
  }, []);

  useEffect(() => {
    void veriyiYukle();
  }, [veriyiYukle]);

  if (hata) {
    return <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{hata}</p>;
  }

  if (!veri) {
    return <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Veriler yükleniyor...</p>;
  }

  const kartlar = [
    { etiket: "Toplam Proje", deger: veri.proje_sayisi },
    { etiket: "Toplam Lisans", deger: veri.lisans_sayisi },
    { etiket: "Toplam Aktivasyon", deger: veri.aktivasyon_sayisi }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {kartlar.map((kart) => (
          <article
            key={kart.etiket}
            className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#fff9eb_100%)] p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{kart.etiket}</p>
            <h3 className="mt-3 text-4xl font-semibold text-slate-950">{kart.deger}</h3>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950">Son İşlem Kayıtları</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {veri.son_loglar.length} kayıt
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {veri.son_loglar.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">Henüz kayıt bulunmuyor.</p>
          ) : (
            veri.son_loglar.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{log.project.name}</p>
                    <p className="text-sm text-slate-600">{log.message}</p>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    {tarihBicimlendir(log.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
