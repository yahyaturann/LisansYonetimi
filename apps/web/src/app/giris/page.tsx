import { GirisFormu } from "../../components/giris-formu";

export default function GirisSayfasi() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.25),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(135deg,_#fffdf7_0%,_#eef5ff_45%,_#f8fafc_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,_rgba(15,23,42,0.03)_100%)]" />

      <section className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 backdrop-blur">
            SaaS Uyumlu Altyapı
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl font-[var(--font-baslik)] text-5xl font-semibold leading-tight text-slate-950">
              Yazılımlarınız için merkezi lisans, proje ve aktivasyon yönetimi
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Türkçe yönetim paneli ile proje bazlı API anahtarı üretin, lisans kurallarını açıp kapatın ve tüm
              doğrulama kayıtlarını tek panelde izleyin.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Esnek lisans kuralları",
              "JWT tabanlı admin oturumu",
              "PostgreSQL + Prisma veri modeli"
            ].map((madde) => (
              <div key={madde} className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-800">{madde}</p>
              </div>
            ))}
          </div>
        </div>

        <GirisFormu />
      </section>
    </main>
  );
}
