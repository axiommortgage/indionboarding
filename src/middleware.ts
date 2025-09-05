import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check maintenance mode
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  if (maintenanceMode) {
    // Allow access to maintenance page and Next.js assets
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/fonts") ||
      pathname === "/favicon.ico" ||
      pathname === "/maintenance"
    ) {
      return NextResponse.next();
    }

    // Redirect all other routes to maintenance page
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  // Add custom headers for document routes (additional security)
  if (
    pathname.includes("/document/") &&
    (pathname.startsWith("/resources") ||
      pathname.startsWith("/compliance") ||
      pathname.startsWith("/printables"))
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
