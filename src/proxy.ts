import { NextResponse, type NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Verify the JWT token using our helper (compatible with Edge runtimes via jose)
  let payload = null;
  if (token) {
    payload = await verifyJWT(token);
  }

  // Auth routing and protection logic
  if (!payload) {
    // If not authenticated, restrict access to protected resources
    const isPublicRoute =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/api/auth");

    if (!isPublicRoute) {
      // Return 401 for API route accesses, redirect to login page for browser navigation
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // If authenticated, redirect away from guest-only pages
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
