import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import prisma from "@/lib/prisma";

const TEST_USER_EMAIL = "test@podcat.com";
const TEST_USER_NAME = "테스트 사용자";

export async function POST() {
  try {
    // 테스트 계정 확인 또는 생성
    let testUser = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
    });

    if (!testUser) {
      // 테스트 계정이 없으면 새로 생성
      testUser = await prisma.user.create({
        data: {
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          image: "/logo.png",
          isAdmin: false,
        },
      });
    }

    // JWT 토큰 생성
    const token = await encode({
      token: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        picture: testUser.image,
        isAdmin: testUser.isAdmin,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // 세션 쿠키 설정
    const response = NextResponse.json(
      { success: true, user: { id: testUser.id, name: testUser.name } },
      { status: 200 }
    );

    // NextAuth 세션 쿠키 설정
    response.cookies.set({
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Test login error:", error);
    return NextResponse.json(
      { error: "테스트 로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}