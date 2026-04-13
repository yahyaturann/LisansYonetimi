"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function GirisFormu() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@yerel.test");
  const [password, setPassword] = useState("123456");
  const [durumMesaji, setDurumMesaji] = useState<string | null>(null);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function formuGonder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGonderiliyor(true);
    setDurumMesaji(null);
    setHataMesaji(null);

    try {
      const yanit = await fetch("/api/oturum/giris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const json = await yanit.json();

      if (!yanit.ok || json.success === false) {
        throw new Error(json.message ?? "Giriş yapılamadı.");
      }

      setDurumMesaji("Giriş başarılı. Panele yönlendiriliyorsun.");
      startTransition(() => {
        router.push("/panel");
        router.refresh();
      });
    } catch (hata) {
      setHataMesaji(hata instanceof Error ? hata.message : "Giriş işlemi başarısız oldu.");
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <form
      onSubmit={formuGonder}
      className="space-y-5 rounded-[2rem] border border-white/55 bg-white/85 p-8 shadow-[0_24px_80px_rgba(20,36,52,0.15)] backdrop-blur"
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">E-posta</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500"
          placeholder="admin@yerel.test"
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Şifre</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500"
          placeholder="Şifrenizi girin"
          type="password"
        />
      </div>

      {durumMesaji ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {durumMesaji}
        </p>
      ) : null}

      {hataMesaji ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {hataMesaji}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={gonderiliyor}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {gonderiliyor ? "Giriş yapılıyor..." : "Panele Gir"}
      </button>
    </form>
  );
}
