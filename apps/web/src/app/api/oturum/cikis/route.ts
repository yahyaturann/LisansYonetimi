import { NextResponse } from "next/server";

import { OTURUM_CEREZI_ADI } from "../../../../lib/ayarlar";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Çıkış yapıldı."
  });

  response.cookies.set(OTURUM_CEREZI_ADI, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0
  });

  return response;
}
