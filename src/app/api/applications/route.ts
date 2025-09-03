import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phoneNumber,
      interestedTopics,
      privacyConsent,
      marketingConsent,
    } = body;

    // 입력 검증
    if (!name || !phoneNumber || !interestedTopics || !privacyConsent) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 관심 주제 개수 검증
    if (
      !Array.isArray(interestedTopics) ||
      interestedTopics.length === 0 ||
      interestedTopics.length > 3
    ) {
      return NextResponse.json(
        { error: "관심 주제는 1개 이상 3개 이하로 선택해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식을 입력해주세요." },
        { status: 400 }
      );
    }

    // 데이터베이스에 저장
    const application = await prisma.userApplication.create({
      data: {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        interestedTopics,
        privacyConsent: Boolean(privacyConsent),
        marketingConsent: Boolean(marketingConsent),
      },
    });

    return NextResponse.json(
      {
        message: "신청이 완료되었습니다.",
        id: application.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Application submission error:", error);

    // 중복 전화번호 에러 처리 (Prisma 에러)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      "meta" in error
    ) {
      const prismaError = error as {
        code: string;
        meta?: { target?: string[] };
      };
      if (
        prismaError.code === "P2002" &&
        prismaError.meta?.target?.includes("phoneNumber")
      ) {
        return NextResponse.json(
          { error: "이미 등록된 전화번호입니다." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 신청 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.userApplication.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.userApplication.count(),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
