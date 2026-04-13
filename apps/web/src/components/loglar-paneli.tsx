"use client";

import { useCallback, useEffect, useState } from "react";

import { tarihBicimlendir } from "../lib/bicimlendir";
import { istemciIstek } from "../lib/istemci-api";
import type { ApiYaniti, LogKaydi } from "../lib/turler";

export function LoglarPaneli() {
  const [loglar, setLoglar] = useState<LogKaydi[]>([]);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  const verileriYukle = useCallback(async () => {
    try {
      const yanit = await istemciIstek<ApiYaniti<LogKaydi[]>>("/api/panel/loglar");
      setLoglar(yanit.data);
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Loglar alınamadı.");
    }
  }, []);

  useEffect(() => {
    void verileriYukle();
  }, [verileriYukle]);

  if (hataMesaji) {
    return <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{hataMesaji}</p>;
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">İşlem Kayıtları</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {loglar.length} kayıt
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {loglar.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">Henüz log bulunmuyor.</p>
        ) : (
          loglar.map((log) => (
            <article key={log.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{log.project.name}</p>
                  <p className="text-sm text-slate-600">{log.message}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {tarihBicimlendir(log.createdAt)}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
