export type ProjeAyarlari = {
  domain_kontrol: boolean;
  ip_kontrol: boolean;
  hwid_kontrol: boolean;
  sure_kontrol: boolean;
  aktivasyon_limiti: boolean;
};

export type LisansMetaVerisi = {
  domain?: string | null;
  ip?: string | null;
  hwid?: string | null;
};

export type DogrulamaSonucu = {
  success: boolean;
  message: string;
  expiresAt: Date | null;
  remainingActivations: number | null;
};

export const varsayilanProjeAyarlari: ProjeAyarlari = {
  domain_kontrol: false,
  ip_kontrol: false,
  hwid_kontrol: false,
  sure_kontrol: false,
  aktivasyon_limiti: false
};
