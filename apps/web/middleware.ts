import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { OTURUM_CEREZI_ADI } from "./src/lib/ayarlar";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(OTURUM_CEREZI_ADI)?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/panel") && !token) {
    return NextResponse.redirect(new URL("/giris", request.url));
  }

  if (pathname === "/giris" && token) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/giris", "/panel/:path*"]
};
