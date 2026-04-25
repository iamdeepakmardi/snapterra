import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("snapterra_token")?.value;
  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup";

  // 1. If user is NOT logged in and trying to access dashboard -> Redirect to Login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If user IS logged in and trying to access Login/Signup -> Redirect to Dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect all dashboard routes
  matcher: [
    "/tasks/:path*",
    "/links/:path*",
    "/screenshots/:path*",
    "/login",
    "/signup",
  ],
};
