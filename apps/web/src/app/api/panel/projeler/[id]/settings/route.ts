import type { NextRequest } from "next/server";

import { yetkiliIstek } from "../../../../../../lib/panel-api";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.text();

  return yetkiliIstek(request, `/api/admin/project/${id}/settings`, {
    method: "PATCH",
    body
  });
}
