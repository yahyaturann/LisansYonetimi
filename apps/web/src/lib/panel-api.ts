import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { API_URL, OTURUM_CEREZI_ADI } from "./ayarlar";

export async function yetkiliIstek(request: NextRequest, yol: string, init?: RequestInit) {
  const token = request.cookies.get(OTURUM_CEREZI_ADI)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Oturum bulunamadı."
      },
      {
        status: 401
      }
    );
  }

  const yanit = await fetch(`${API_URL}${yol}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const json = await yanit.json();

  return NextResponse.json(json, {
    status: yanit.status
  });
}
