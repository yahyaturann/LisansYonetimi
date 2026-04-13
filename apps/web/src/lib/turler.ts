export type ProjeAyarlari = {
  domain_kontrol: boolean;
  ip_kontrol: boolean;
  hwid_kontrol: boolean;
  sure_kontrol: boolean;
  aktivasyon_limiti: boolean;
};

export type Proje = {
  id: string;
  name: string;
  apiKey: string;
  licensePrefix: string;
  settings: ProjeAyarlari;
  createdAt: string;
};

export type Aktivasyon = {
  id: string;
  ip?: string | null;
  domain?: string | null;
  hwid?: string | null;
  createdAt: string;
};

export type Lisans = {
  id: string;
  projectId: string;
  licenseKey: string;
  expiresAt?: string | null;
  maxActivations?: number | null;
  metadata: {
    domain?: string | null;
    ip?: string | null;
    hwid?: string | null;
  };
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
  activations: Aktivasyon[];
};

export type LogKaydi = {
  id: string;
  message: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
};

export type DashboardOzeti = {
  proje_sayisi: number;
  lisans_sayisi: number;
  aktivasyon_sayisi: number;
  son_loglar: LogKaydi[];
};

export type ApiYaniti<T> = {
  success: boolean;
  message: string;
  data: T;
};
