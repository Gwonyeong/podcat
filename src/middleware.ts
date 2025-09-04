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
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Admin 경로는 토큰과 isAdmin 권한 모두 필요
        if (pathname.startsWith("/admin")) {
          return !!token?.isAdmin;
        }
        
        // My 경로는 토큰만 있으면 됨 (클라이언트에서 추가 처리)
        if (pathname.startsWith("/my")) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/my/:path*",
  ],
};