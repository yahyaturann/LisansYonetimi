export function tarihBicimlendir(deger?: string | null) {
  if (!deger) {
    return "Tanımsız";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(deger));
}

export function kalanGunHesapla(deger?: string | null): { text: string; renk: string } {
  if (!deger) {
    return { text: "Sınırsız", renk: "text-slate-500" };
  }

  const bitisTarihi = new Date(deger).getTime();
  const suan = Date.now();
  const fark = Math.ceil((bitisTarihi - suan) / (1000 * 60 * 60 * 24));

  if (fark < 0) {
    return { text: `${Math.abs(fark)} gün geçmiş`, renk: "text-rose-600" };
  }

  if (fark === 0) {
    return { text: "Bugün bitiyor", renk: "text-amber-600" };
  }

  if (fark <= 7) {
    return { text: `${fark} gün kaldı`, renk: "text-amber-600" };
  }

  if (fark <= 30) {
    return { text: `${fark} gün kaldı`, renk: "text-emerald-600" };
  }

  return { text: `${fark} gün kaldı`, renk: "text-emerald-600" };
}
