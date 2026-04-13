import type { NextRequest } from "next/server";

import { yetkiliIstek } from "../../../../../lib/panel-api";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return yetkiliIstek(request, `/api/admin/license/${id}`, {
    method: "DELETE"
  });
}
