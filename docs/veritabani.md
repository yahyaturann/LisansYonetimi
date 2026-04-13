# Veritabanı Tasarımı

## Genel Yaklaşım

Veritabanı PostgreSQL üzerinde çalışacak ve Prisma ORM ile yönetilecektir. Tablolar hem yönetim paneli operasyonlarını hem de lisans doğrulama akışını destekleyecek şekilde tasarlanmıştır.

## Tablolar

## `users`

Admin kullanıcılarını tutar.

Alanlar:

- `id`: Benzersiz kullanıcı kimliği
- `email`: Giriş için kullanılan e-posta adresi
- `password`: `bcrypt` ile hashlenmiş parola
- `created_at`: Oluşturulma zamanı

Kurallar:

- `email` benzersiz olmalıdır
- İlk kurulumda seed ile varsayılan admin kullanıcı oluşturulabilir

## `projects`

Sistemde lisans yönetimi yapılacak yazılım projelerini tutar.

Alanlar:

- `id`: Benzersiz proje kimliği
- `name`: Proje adı
- `api_key`: Harici istemcilerin doğrulama isteğinde göndereceği benzersiz anahtar
- `settings`: Lisans kontrol ayarlarını tutan JSON alanı
- `created_at`: Oluşturulma zamanı

Örnek `settings`:

```json
{
  "domain_kontrol": true,
  "ip_kontrol": true,
  "hwid_kontrol": false,
  "sure_kontrol": true,
  "aktivasyon_limiti": true
}
```

## `licenses`

Belirli bir projeye ait lisans kayıtlarını tutar.

Alanlar:

- `id`: Benzersiz lisans kimliği
- `project_id`: Bağlı olduğu proje
- `license_key`: Lisans anahtarı
- `expires_at`: Bitiş tarihi
- `max_activations`: Maksimum aktivasyon sayısı
- `metadata`: Domain, IP ve HWID gibi kural verilerini tutan JSON alanı
- `created_at`: Oluşturulma zamanı

Örnek `metadata`:

```json
{
  "domain": "ornek.com",
  "ip": "127.0.0.1",
  "hwid": "PC-001"
}
```

## `activations`

Başarılı doğrulama sonrasında oluşturulan aktivasyon kayıtlarını tutar.

Alanlar:

- `id`: Benzersiz kayıt kimliği
- `license_id`: Bağlı lisans
- `ip`: Doğrulama sırasında gelen IP
- `domain`: Doğrulama sırasında gelen domain
- `hwid`: Doğrulama sırasında gelen HWID
- `created_at`: Aktivasyon zamanı

Kullanım amaçları:

- Aktivasyon limiti kontrolü
- Geçmiş erişimlerin izlenmesi
- Güvenlik analizi

## `logs`

Proje bazlı sistem olaylarını tutar.

Alanlar:

- `id`: Benzersiz log kimliği
- `project_id`: İlgili proje
- `message`: Türkçe log mesajı
- `created_at`: Log zamanı

Kullanım amaçları:

- Lisans doğrulama denemeleri
- Hatalar
- Admin işlemleri

## İlişkiler

- Bir `project` birden çok `license` kaydına sahip olabilir
- Bir `project` birden çok `log` kaydına sahip olabilir
- Bir `license` birden çok `activation` kaydına sahip olabilir

İlişki özeti:

- `projects (1) -> licenses (N)`
- `projects (1) -> logs (N)`
- `licenses (1) -> activations (N)`

## Prisma Modelleme Notları

- JSON alanları için Prisma `Json` tipi kullanılacaktır
- Tarih alanları için `DateTime`
- Kimlik alanları için `String` + `cuid()` tercih edilecektir
- Zaman damgaları için `@default(now())` kullanılacaktır

## İndeksleme

Performans için aşağıdaki alanlarda indeks önerilir:

- `projects.api_key`
- `licenses.project_id`
- `licenses.license_key`
- `activations.license_id`
- `logs.project_id`

## Veri Bütünlüğü

- `api_key` benzersiz olmalıdır
- `license_key` benzersiz olmalıdır
- Silinen projeler için ilişkili kayıtların korunması ya da kontrollü silinmesi servis katmanında yönetilecektir
- Aktivasyon sayısı doğrudan saklanmak yerine `activations` tablosundan sayılacaktır

## Örnek Akış

1. Admin bir proje oluşturur
2. Sistem benzersiz bir `api_key` üretir
3. Admin bu proje için lisans oluşturur
4. Harici istemci `license_key`, `project_id` ve ek doğrulama alanları ile istekte bulunur
5. Sistem kuralları kontrol eder
6. Başarılı ise `activations` tablosuna kayıt açılır
7. Sonuç ve olay `logs` tablosuna yazılır
