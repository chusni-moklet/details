import { type NextRequest, NextResponse } from "next/server";

// Proxy minimal — hanya refresh session cookie, tidak memblokir apapun
// Auth protection dilakukan di level page (server component)
export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
