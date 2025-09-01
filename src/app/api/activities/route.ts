import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      action,
      trackId,
      trackTitle,
      category,
      duration,
      userAgent,
      ipAddress,
    } = body;

    // 필수 필드 검증
    if (!sessionId || !action) {
      return NextResponse.json(
        { error: "sessionId와 action은 필수입니다." },
        { status: 400 }
      );
    }

    // 사용자 활동 저장
    const activity = await prisma.userActivity.create({
      data: {
        sessionId,
        action,
        trackId,
        trackTitle,
        category,
        duration,
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json(
      { message: "활동이 성공적으로 저장되었습니다.", activity },
      { status: 201 }
    );
  } catch (error) {
    console.error("사용자 활동 저장 오류:", error);
    return NextResponse.json(
      { error: "활동 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const action = searchParams.get("action");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId는 필수입니다." },
        { status: 400 }
      );
    }

    // 필터링 조건 구성
    const where: {
      sessionId: string;
      action?: string;
    } = { sessionId };
    if (action) {
      where.action = action;
    }

    // 사용자 활동 조회
    const activities = await prisma.userActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("사용자 활동 조회 오류:", error);
    return NextResponse.json(
      { error: "활동 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
