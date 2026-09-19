import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

/**
 * UX-level route guard only. It redirects unauthenticated/wrong-role visitors away from
 * /admin and /writer before a page even renders, but it is NOT the security boundary —
 * every Server Action and page under these paths re-checks the session independently
 * (see requireRole in src/lib/auth/current-user.ts), since a matcher change here could
 * silently stop covering a route.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    if (session.role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/writer")) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    if (session.role !== "WRITER") return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/writer/:path*"],
};
