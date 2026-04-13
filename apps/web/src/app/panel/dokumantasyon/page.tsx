"use client";

import { PanelKabugu } from "../../../components/panel-kabugu";

export default function DokumantasyonSayfasi() {
  const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  return (
    <PanelKabugu
      baslik="Dokümantasyon"
      altBaslik="Lisans doğrulama API'sini nasıl kullanacağını öğren."
    >
      <div className="prose prose-slate mx-auto max-w-none">
        {/* Giriş */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Giriş</h2>
          <p className="text-slate-600 leading-relaxed">
            Bu sistem, yazılımlarınızı lisanslama ve doğrulama için kullanabileceğiniz bir API sağlar.
            API'yi kullanarak lisans anahtarlarını doğrulayabilir, sürelerini kontrol edebilir ve
            aktivasyon sayılarını takip edebilirsiniz.
          </p>
        </section>

        {/* API Kullanımı */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">API Kullanımı</h2>
          <p className="text-slate-600 mb-4">
            Lisans doğrulama için aşağıdaki endpoint'i kullanın:
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <code className="font-mono text-sm">
              POST {apiBaseURL}/api/license/validate
            </code>
          </div>
        </section>

        {/* Örnek İstek */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Örnek İstek</h2>
          <p className="text-slate-600 mb-4">Aşağıdaki JSON formatında bir istek gönderin:</p>

          <div className="rounded-xl border border-slate-200 bg-slate-950 p-6">
            <pre className="rounded-lg bg-slate-900 p-4 text-sm leading-relaxed text-slate-300">
              {`{
  "license_key": "LIS-ABCD-EFGH-IJKL",
  "project_id": "proje_kimligi",
  "domain": "ornek.com",
  "ip": "127.0.0.1",
  "hwid": "PC-001"
}`}
            </pre>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-100 px-2 py-1 text-amber-800 font-semibold">
                license_key
              </span>
              <span className="text-slate-600">Lisans anahtarınız</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-100 px-2 py-1 text-amber-800 font-semibold">
                project_id
              </span>
              <span className="text-slate-600">Proje kimliğiniz</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-800">
                domain
              </span>
              <span className="text-slate-600">
                İsteğe bağlı - Eğer proje ayarlarında domain kontrolü aktifse zorunludur
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-800">
                ip
              </span>
              <span className="text-slate-600">
                İsteğe bağlı - Eğer proje ayarlarında IP kontrolü aktifse zorunludur
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-800">
                hwid
              </span>
              <span className="text-slate-600">
                İsteğe bağlı - Eğer proje ayarlarında HWID kontrolü aktifse zorunludur
              </span>
            </div>
          </div>
        </section>

        {/* Response */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Response</h2>

          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-emerald-700">Başarılı Response</h3>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
              <pre className="rounded-lg bg-white p-4 text-sm leading-relaxed text-slate-700">
                {`{
  "success": true,
  "message": "Lisans geçerli",
  "expires_at": "2026-12-31T23:59:59.000Z",
  "remaining_activations": 2
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-rose-700">Hata Response</h3>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
              <pre className="rounded-lg bg-white p-4 text-sm leading-relaxed text-slate-700">
                {`{
  "success": false,
  "message": "Lisans bulunamadı",
  "expires_at": null,
  "remaining_activations": null
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Hata Mesajları */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Hata Mesajları</h2>
          <div className="space-y-3">
            {[
              {
                message: "Lisans bulunamadı",
                description: "Geçersiz lisans anahtarı veya proje kimliği"
              },
              {
                message: "Lisans süresi dolmuş",
                description: "Lisansın süresi dolmuş"
              },
              {
                message: "Domain uyuşmuyor",
                description: "Proje ayarlarında domain kontrolü aktifse, lisansın domain'i ile istemcinin domain'i eşleşmelidir"
              },
              {
                message: "IP uyuşmuyor",
                description: "Proje ayarlarında IP kontrolü aktifse, lisansın IP'si ile istemcinin IP'si eşleşmelidir"
              },
              {
                message: "HWID uyuşmuyor",
                description: "Proje ayarlarında HWID kontrolü aktifse, lisansın HWID'si ile istemcinin HWID'si eşleşmelidir"
              },
              {
                message: "Aktivasyon limiti doldu",
                description: "Lisansın maksimum aktivasyon sayısına ulaşmış"
              }
            ].map((hata, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                    {hata.message}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{hata.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Kod Örnekleri */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Kod Örnekleri</h2>

          {/* Node.js */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                Node.js
              </span>
              <span className="text-sm text-slate-500">JavaScript / TypeScript</span>
            </div>
            <pre className="rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-300">
              {`fetch("${apiBaseURL}/api/license/validate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    license_key: "LIS-ABCD-EFGH-IJKL",
    project_id: "PROJE_ID",
    domain: "ornek.com",
    ip: "127.0.0.1",
    hwid: "PC-001"
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log("Lisans geçerli:", data.message);
    console.log("Bitiş tarihi:", data.expires_at);
    console.log("Kalan aktivasyon:", data.remaining_activations);
  } else {
    console.error("Hata:", data.message);
  }
})
.catch(error => console.error("İstek hatası:", error));`}
            </pre>
          </div>

          {/* PHP */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                PHP
              </span>
              <span className="text-sm text-slate-500">PHP 7.4+</span>
            </div>
            <pre className="rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-300">
              {`<?php

$url = "${apiBaseURL}/api/license/validate";
$apiKey = "YOUR_API_KEY";
$data = [
    "license_key" => "LIS-ABCD-EFGH-IJKL",
    "project_id" => "PROJE_ID",
    "domain" => "ornek.com",
    "ip" => "127.0.0.1",
    "hwid" => "PC-001"
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\\r\\n" .
                    "x-api-key: " . $apiKey,
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === false) {
    die("İstek başarısız");
}

$result = json_decode($response, true);

if ($result['success']) {
    echo "Lisans geçerli: " . $result['message'] . "\\n";
    echo "Bitiş tarihi: " . $result['expires_at'] . "\\n";
    echo "Kalan aktivasyon: " . $result['remaining_activations'] . "\\n";
} else {
    echo "Hata: " . $result['message'] . "\\n";
}
?>`}
            </pre>
          </div>

          {/* Python */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                Python
              </span>
              <span className="text-sm text-slate-500">Python 3.6+</span>
            </div>
            <pre className="rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-300">
              {`import requests

url = "${apiBaseURL}/api/license/validate"
api_key = "YOUR_API_KEY"
data = {
    "license_key": "LIS-ABCD-EFGH-IJKL",
    "project_id": "PROJE_ID",
    "domain": "ornek.com",
    "ip": "127.0.0.1",
    "hwid": "PC-001"
}

headers = {
    "Content-Type": "application/json",
    "x-api-key": api_key
}

try:
    response = requests.post(url, json=data, headers=headers)
    result = response.json()

    if result['success']:
        print("Lisans geçerli:", result['message'])
        print("Bitiş tarihi:", result['expires_at'])
        print("Kalan aktivasyon:", result['remaining_activations'])
    else:
        print("Hata:", result['message'])

except requests.exceptions.RequestException as e:
    print("İstek hatası:", e)`}
            </pre>
          </div>
        </section>

        {/* Header Bilgisi */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Header Bilgisi</h2>
          <p className="text-slate-600 mb-4">
            Her istekte aşağıdaki header'ı eklemelisiniz:
          </p>

          <div className="rounded-lg bg-slate-950 p-4">
            <code className="font-mono text-sm text-amber-200">
              x-api-key: YOUR_API_KEY
            </code>
          </div>
        </section>
      </div>
    </PanelKabugu>
  );
}