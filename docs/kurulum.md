# Kurulum Rehberi

## Gereksinimler

- Node.js 20+
- npm 10+
- PostgreSQL 15+ önerilir

## 1. Ortam Değişkenlerini Hazırlama

Kök dizinde `.env` dosyası oluşturun.

Örnek içerik:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lisans_yonetim"
JWT_SECRET="degistirilmesi_gereken_guclu_bir_gizli_anahtar"
ADMIN_EMAIL="admin@yerel.test"
ADMIN_PASSWORD="123456"
NEXT_PUBLIC_API_URL="http://localhost:4000"
PORT=4000
DEMO_MODU="false"
```

Not:

- Production kullanımında `DEMO_MODU="false"` bırakılmalı ve gerçek PostgreSQL servisi kullanılmalıdır
- PostgreSQL kurulumu olmayan hızlı yerel tanıtım senaryoları için geçici olarak `DEMO_MODU="true"` açılabilir

## 2. Bağımlılıkları Kurma

```bash
npm install
```

## 3. Veritabanını Hazırlama

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Not:

- Geliştirme ortamında `db:push` yeterlidir
- Production ortamında migration tabanlı dağıtım tercih edilmelidir

## 4. Uygulamaları Geliştirme Modunda Başlatma

Backend:

```bash
npm run dev:api
```

Frontend:

```bash
npm run dev:web
```

Alternatif olarak iki süreci ayrı terminallerde çalıştırın.

## 5. Erişim Bilgileri

- Admin panel: `http://localhost:3000`
- API servis: `http://localhost:4000`

Varsayılan admin kullanıcısı:

- E-posta: `.env` içindeki `ADMIN_EMAIL`
- Şifre: `.env` içindeki `ADMIN_PASSWORD`

## 6. Production İçin Öneriler

- `JWT_SECRET` güçlü ve uzun bir değer olmalıdır
- PostgreSQL erişimi dış ağa kapatılmalı veya güvenli ağ arkasında tutulmalıdır
- Reverse proxy olarak Nginx veya benzeri çözüm kullanılmalıdır
- HTTPS zorunlu hale getirilmelidir
- `.env` dosyası versiyonlanmamalıdır
- Gözlemleme için merkezi log toplama eklenmelidir

## 7. Sık Karşılaşılan Sorunlar

### Prisma istemcisi oluşmadı

Çözüm:

```bash
npm run db:generate
```

### Veritabanına bağlanılamıyor

Kontrol edin:

- PostgreSQL servisinin çalıştığını
- `DATABASE_URL` bilgisinin doğru olduğunu
- Kullanıcı adı/şifre bilgilerinin doğru olduğunu

### Giriş başarısız

Kontrol edin:

- `db:seed` komutunun çalıştığını
- `.env` içindeki admin bilgilerinin doğru olduğunu

## 8. Yararlı Komutlar

```bash
npm run lint
npm run build
npm run test
```
