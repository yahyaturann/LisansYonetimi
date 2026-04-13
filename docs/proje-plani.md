# Lisans Yönetim Sistemi Proje Planı

## 1. Proje Özeti

Bu proje, birden fazla yazılım ürünü için lisans üretme, doğrulama, aktivasyon takibi ve yönetim paneli sağlayan SaaS uyumlu bir lisans yönetim sistemi oluşturur. Sistem tamamen Türkçe olacak, her proje kendi API anahtarı ve bağımsız lisans kuralları ile çalışacaktır.

## 2. Hedefler

- Farklı projeleri birbirinden izole şekilde yönetebilmek
- Esnek lisans kontrollerini proje bazında açıp kapatabilmek
- Admin panelinden proje, lisans ve log yönetimini gerçekleştirebilmek
- Harici istemcilerin REST API üzerinden lisans doğrulaması yapabilmesini sağlamak
- Production ortamına uygun güvenlik ve yapılandırma temeli sunmak

## 3. Kapsam

### Dahil Olan Özellikler

- JWT tabanlı admin kimlik doğrulama
- Proje oluşturma ve güncelleme
- Proje bazlı API anahtarı üretimi
- Lisans oluşturma, listeleme ve silme
- Lisans doğrulama endpointi
- Aktivasyon kayıtları
- Rate limit ve temel güvenlik önlemleri
- Türkçe yönetim paneli
- Prisma ile PostgreSQL veri modeli
- Kurulum ve geliştirme dokümantasyonu

### İlk Sürümde Bilinçli Olarak Hariç Tutulanlar

- Rol bazlı yetkilendirme
- Takım/organizasyon yönetimi
- E-posta bildirimleri
- Gelişmiş denetim raporları
- Harici ödeme/billing entegrasyonları
- Çoklu dil desteği

## 4. Mimari Yaklaşım

Sistem iki ana uygulamadan oluşacaktır:

1. `apps/api`
   Express.js tabanlı backend servisi. Lisans doğrulama, admin işlemleri, JWT üretimi, loglama ve Prisma entegrasyonu burada yer alacaktır.

2. `apps/web`
   Next.js App Router kullanan yönetim paneli. Giriş ekranı, dashboard, projeler, lisanslar ve loglar sayfaları bu uygulamada bulunacaktır.

Tek depo içinde npm workspaces ile yönetilen monorepo yapı kullanılacaktır. Bu sayede backend ve frontend birlikte geliştirilecek, ortak betikler tek yerden çalıştırılacaktır.

## 5. Modül Kırılımı

### Backend Modülleri

- `auth`: Admin giriş ve JWT üretimi
- `projects`: Proje oluşturma, ayar güncelleme, API anahtarı üretimi
- `licenses`: Lisans oluşturma, listeleme, silme
- `validation`: Lisans doğrulama akışı ve kurallar
- `logs`: Sistem olay kayıtları
- `activations`: Aktivasyon kayıtları ve limit kontrolü

### Frontend Modülleri

- `giris`: Login sayfası ve oturum yönetimi
- `dashboard`: Özet istatistikler
- `projeler`: Proje listeleme, oluşturma, ayar güncelleme
- `lisanslar`: Lisans oluşturma, listeleme, silme
- `loglar`: Sistem loglarını görüntüleme

## 6. Lisans Kural Motoru

Her proje için `settings` alanında JSON yapı tutulacaktır. Örnek yapı:

```json
{
  "domain_kontrol": true,
  "ip_kontrol": false,
  "hwid_kontrol": true,
  "sure_kontrol": true,
  "aktivasyon_limiti": true
}
```

Doğrulama akışı sadece `true` olan kuralları uygular. Böylece her proje farklı lisans davranışı tanımlayabilir.

## 7. Güvenlik Planı

- Admin şifreleri `bcrypt` ile hashlenir
- JWT erişim belirteci ile admin oturumu doğrulanır
- Her proje için benzersiz API anahtarı üretilir
- Genel API katmanında rate limit uygulanır
- Hassas yapılandırmalar `.env` üzerinden yönetilir
- Hata mesajları istemciye kontrollü şekilde döndürülür
- Log sistemi üzerinden kritik olaylar kayıt altına alınır

## 8. Geliştirme Aşamaları

### Aşama 1: Dokümantasyon ve İskelet

- `docs/` altındaki tüm Türkçe dokümanların hazırlanması
- Monorepo yapısının kurulması
- Kök yapılandırmaların eklenmesi

### Aşama 2: Veri Katmanı

- Prisma şemasının yazılması
- PostgreSQL bağlantısının yapılandırılması
- İlk migration ve seed mekanizmasının hazırlanması

### Aşama 3: Backend

- Express sunucusu
- Auth akışı
- Admin endpointleri
- Lisans doğrulama endpointi
- Loglama ve doğrulama kuralları

### Aşama 4: Frontend

- Next.js panel iskeleti
- Login akışı
- Dashboard ve yönetim sayfaları
- Türkçe form ve tablo bileşenleri

### Aşama 5: Test ve Doğrulama

- Backend entegrasyon testleri
- Frontend temel smoke kontrolleri
- Build ve lint doğrulaması
- Yerelde çalıştırma testleri

## 9. Riskler ve Önlemler

### Risk: Ortamda PostgreSQL bulunmaması

Önlem: `.env` yapısı ve kurulum dokümanında gerekli kurulum adımları ayrıntılı anlatılacaktır. Geliştirme sırasında Prisma komutları PostgreSQL bağlantısı ile çalışacak şekilde yapılandırılacaktır.

### Risk: Lisans doğrulama kurallarının karmaşıklaşması

Önlem: Kural kontrolleri ayrı yardımcı fonksiyonlar halinde modüler yazılacaktır.

### Risk: Frontend ile backend arasında oturum uyuşmazlığı

Önlem: JWT tabanlı, açık kontratlı bir admin API kullanılacak ve frontend servis katmanı net ayrılacaktır.

## 10. Başarı Kriterleri

- Admin kullanıcı sisteme giriş yapabilmeli
- Yeni proje oluşturulabilmeli
- Proje ayarları güncellenebilmeli
- Lisans oluşturulup listelenebilmeli
- API üzerinden lisans doğrulanabilmeli
- Kurala aykırı durumlarda Türkçe hata mesajı dönmeli
- Başarılı doğrulamada aktivasyon kaydı oluşmalı
- Log ekranında işlemler görüntülenebilmeli
- Proje yerelde ayağa kaldırılıp çalıştırılabilmeli
