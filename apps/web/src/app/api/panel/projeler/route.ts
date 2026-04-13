import type { NextRequest } from "next/server";

import { yetkiliIstek } from "../../../../lib/panel-api";

export async function GET(request: NextRequest) {
  return yetkiliIstek(request, "/api/admin/projects", {
    method: "GET"
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  return yetkiliIstek(request, "/api/admin/project/create", {
    method: "POST",
    body
  });
}
