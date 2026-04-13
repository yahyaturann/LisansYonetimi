import { NextResponse } from "next/server";

import { API_URL, OTURUM_CEREZI_ADI } from "../../../../lib/ayarlar";

export async function POST(request: Request) {
  const body = await request.json();
  const yanit = await fetch(`${API_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const json = await yanit.json();
  const response = NextResponse.json(json, {
    status: yanit.status
  });

  if (yanit.ok && json.token) {
    response.cookies.set(OTURUM_CEREZI_ADI, json.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/"
    });
  }

  return response;
}
