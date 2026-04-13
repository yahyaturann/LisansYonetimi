# API Dokümanı

Bu doküman, sistemdeki temel REST endpointlerini ve beklenen veri yapılarını açıklar.

## Temel Bilgiler

- İçerik tipi: `application/json`
- Tüm admin endpointleri JWT gerektirir
- Lisans doğrulama endpointi proje API anahtarı ile korunur
- Tüm yanıt mesajları Türkçedir

## Kimlik Doğrulama

### `POST /api/admin/auth/login`

Admin kullanıcının giriş yapmasını sağlar.

İstek:

```json
{
  "email": "admin@example.com",
  "password": "parola"
}
```

Başarılı yanıt:

```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "token": "jwt-token"
}
```

Hatalı yanıt:

```json
{
  "success": false,
  "message": "E-posta veya şifre hatalı."
}
```

## Lisans Doğrulama

### `POST /api/license/validate`

Belirtilen lisansın ilgili proje altında geçerli olup olmadığını kontrol eder.

Başlıklar:

- `x-api-key`: Projenin API anahtarı

İstek:

```json
{
  "license_key": "LIS-XXXX-XXXX",
  "project_id": "proje_kimligi",
  "domain": "ornek.com",
  "ip": "127.0.0.1",
  "hwid": "PC-001"
}
```

Başarılı yanıt:

```json
{
  "success": true,
  "message": "Lisans doğrulandı.",
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

Olası hata yanıtları:

```json
{
  "success": false,
  "message": "Lisans bulunamadı.",
  "expires_at": null
}
```

```json
{
  "success": false,
  "message": "Lisansın süresi dolmuş.",
  "expires_at": "2025-01-01T00:00:00.000Z"
}
```

```json
{
  "success": false,
  "message": "Aktivasyon limiti aşıldı.",
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

```json
{
  "success": false,
  "message": "Domain doğrulaması başarısız.",
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

Kurallar:

- Proje kimliği ve `x-api-key` eşleşmelidir
- Projenin `settings` alanında açık olan kontroller uygulanır
- Başarılı doğrulamada aktivasyon kaydı açılır
- Her sonuç için uygun log kaydı oluşturulur

## Proje Yönetimi

### `POST /api/admin/project/create`

Yeni proje oluşturur.

JWT gerekir.

İstek:

```json
{
  "name": "CRM Yazılımı",
  "settings": {
    "domain_kontrol": true,
    "ip_kontrol": false,
    "hwid_kontrol": true,
    "sure_kontrol": true,
    "aktivasyon_limiti": true
  }
}
```

Başarılı yanıt:

```json
{
  "success": true,
  "message": "Proje oluşturuldu.",
  "data": {
    "id": "proje_id",
    "name": "CRM Yazılımı",
    "api_key": "benzersiz_api_anahtari"
  }
}
```

### `PATCH /api/admin/project/:id/settings`

Mevcut projenin lisans ayarlarını günceller.

İstek:

```json
{
  "settings": {
    "domain_kontrol": false,
    "ip_kontrol": true,
    "hwid_kontrol": false,
    "sure_kontrol": true,
    "aktivasyon_limiti": true
  }
}
```

## Lisans Yönetimi

### `POST /api/admin/license/create`

Yeni lisans oluşturur.

İstek:

```json
{
  "project_id": "proje_id",
  "expires_at": "2026-12-31T23:59:59.000Z",
  "max_activations": 3,
  "metadata": {
    "domain": "ornek.com",
    "ip": "127.0.0.1",
    "hwid": "PC-001"
  }
}
```

Başarılı yanıt:

```json
{
  "success": true,
  "message": "Lisans oluşturuldu.",
  "data": {
    "id": "lisans_id",
    "license_key": "LIS-ABCD-EFGH-IJKL"
  }
}
```

### `GET /api/admin/licenses`

Tüm lisansları proje bilgisi ile birlikte listeler.

Sorgu parametreleri:

- `project_id` (opsiyonel)

### `DELETE /api/admin/license/:id`

Belirtilen lisansı siler.

## Log Yönetimi

### `GET /api/admin/logs`

Log kayıtlarını listeler.

Sorgu parametreleri:

- `project_id` (opsiyonel)
- `limit` (opsiyonel, varsayılan 50)

Başarılı yanıt:

```json
{
  "success": true,
  "message": "Log kayıtları getirildi.",
  "data": [
    {
      "id": "log_id",
      "project_id": "proje_id",
      "message": "Lisans doğrulama başarılı.",
      "created_at": "2026-04-12T10:00:00.000Z"
    }
  ]
}
```

## Ortak Hata Yanıt Formatı

```json
{
  "success": false,
  "message": "İşlem sırasında beklenmeyen bir hata oluştu."
}
```

## HTTP Durum Kodları

- `200`: Başarılı istek
- `201`: Yeni kaynak oluşturuldu
- `400`: Geçersiz veri
- `401`: Yetkisiz erişim
- `403`: Erişim reddedildi
- `404`: Kayıt bulunamadı
- `429`: Çok fazla istek gönderildi
- `500`: Sunucu hatası
