import type { NextRequest } from "next/server";

import { yetkiliIstek } from "../../../../lib/panel-api";

export async function GET(request: NextRequest) {
  return yetkiliIstek(request, "/api/admin/license", {
    method: "GET"
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return yetkiliIstek(request, "/api/admin/license/create", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
