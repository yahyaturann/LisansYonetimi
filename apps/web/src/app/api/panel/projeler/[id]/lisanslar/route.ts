import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import { yetkiliIstek } from "../../../../../../lib/panel-api";

const lisansOlusturmaSemasi = z.object({
  project_id: z.string().min(1, "Proje seçimi zorunludur."),
  expires_at: z
    .string()
    .datetime("Geçerli bir bitiş tarihi giriniz.")
    .nullable()
    .optional(),
  max_activations: z.coerce.number().int().positive().nullable().optional(),
  metadata: z
    .object({
      domain: z.string().nullable().optional(),
      ip: z.string().nullable().optional(),
      hwid: z.string().nullable().optional(),
      not: z.string().optional()
    })
    .default({})
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projeId } = await params;
    const veri = lisansOlusturmaSemasi.parse(await request.json());

    return yetkiliIstek(request, `/api/admin/license/project/${projeId}`, {
      method: "POST",
      body: JSON.stringify({
        project_id: veri.project_id,
        expires_at: veri.expires_at ? new Date(veri.expires_at).toISOString() : null,
        max_activations: veri.max_activations ?? null,
        metadata: {
          domain: veri.metadata.domain || null,
          ip: veri.metadata.ip || null,
          hwid: veri.metadata.hwid || null,
          not: veri.metadata.not
        }
      })
    });
  } catch (hata) {
    if (hata instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: hata.issues[0]?.message ?? "Geçersiz istek verisi."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: hata instanceof Error ? hata.message : "Lisans oluşturulamadı."
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projeId } = await params;

  return yetkiliIstek(request, `/api/admin/license/project/${projeId}`, {
    method: "GET"
  });
}
