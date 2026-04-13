"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuler = [
  { href: "/panel", etiket: "Dashboard" },
  { href: "/panel/projeler", etiket: "Projeler" },
  { href: "/panel/lisanslar", etiket: "Lisanslar" },
  { href: "/panel/loglar", etiket: "Loglar" },
  { href: "/panel/dokumantasyon", etiket: "Dökümantasyon" }
] as const;

type PanelKabuguProps = {
  baslik: string;
  altBaslik: string;
  children: React.ReactNode;
};

export function PanelKabugu({ baslik, altBaslik, children }: PanelKabuguProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function cikisYap() {
    await fetch("/api/oturum/cikis", { method: "POST" });
    router.push("/giris");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.25),_transparent_30%),linear-gradient(135deg,_#fffdf7_0%,_#edf4ff_48%,_#f8fafc_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Lisans Merkezi</p>
            <h1 className="text-2xl font-semibold">Yönetim Paneli</h1>
            <p className="text-sm text-slate-300">
              Tüm projeleri, lisansları ve doğrulama akışlarını tek yerden yönet.
            </p>
          </div>

          <nav className="mt-10 space-y-3">
            {menuler.map((menu) => {
              const aktifMi = pathname === menu.href;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    aktifMi ? "bg-white text-slate-950" : "bg-white/8 text-slate-200 hover:bg-white/12"
                  }`}
                >
                  {menu.etiket}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={cikisYap}
            className="mt-10 w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Çıkış Yap
          </button>
        </aside>

        <main className="space-y-6 rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-600">Yönetim Alanı</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">{baslik}</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">{altBaslik}</p>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
