import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Define protected routes for authenticated users only
  const protectedRoutes = [
    "/qrcodegen",
    "/crud",
    "/taxparameters",
    "/calculator",
  ];

  // Define routes that should be inaccessible to authenticated users
  const authRestrictedRoutes = ["/login", "/register"];

  // If the user is NOT authenticated and tries to access a protected page, redirect to login
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // If the user IS authenticated and tries to access login or register, redirect to dashboard or home
  if (authRestrictedRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/", req.url)); // Redirect to homepage or dashboard
  }

  return NextResponse.next();
}

// Apply the middleware to relevant routes
export const config = {
  matcher: [
    "/qrcodegen/:path*",
    "/crud/:path*",
    "/taxparameters/:path*",
    "/calculator/:path*",
    "/login",
    "/register",
  ],
};
