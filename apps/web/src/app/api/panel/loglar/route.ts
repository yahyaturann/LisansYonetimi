import type { NextRequest } from "next/server";

import { yetkiliIstek } from "../../../../lib/panel-api";

export async function GET(request: NextRequest) {
  return yetkiliIstek(request, "/api/admin/logs", {
    method: "GET"
  });
}
