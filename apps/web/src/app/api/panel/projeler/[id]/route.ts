import { NextRequest, NextResponse } from "next/server";

import { istemciIstek } from "../../../../../lib/istemci-api";
import type { ApiYaniti, Proje } from "../../../../../lib/turler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projeId } = await params;
    const yanit = await istemciIstek<ApiYaniti<Proje>>(`/api/admin/projects/${projeId}`);

    return NextResponse.json(yanit);
  } catch (hata) {
    return NextResponse.json(
      {
        success: false,
        message: hata instanceof Error ? hata.message : "Proje bulunamadı."
      },
      { status: 404 }
    );
  }
}