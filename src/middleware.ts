import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    
    // Admin 경로 접근 시 isAdmin 체크
    if (isAdminRoute && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/main/:path*",
    "/mypage/:path*",
  ],
};