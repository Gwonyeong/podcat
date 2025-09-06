import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activities } = body;

    // 활동 배열 검증
    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { error: "activities 배열이 필요합니다." },
        { status: 400 }
      );
    }

    // 배치 크기 제한 (최대 50개)
    if (activities.length > 50) {
      return NextResponse.json(
        { error: "한 번에 최대 50개의 활동만 전송할 수 있습니다." },
        { status: 400 }
      );
    }

    // 트랜잭션으로 배치 삽입
    const result = await prisma.$transaction(async (tx) => {
      const createdActivities = [];
      
      for (const activity of activities) {
        const {
          sessionId,
          action,
          trackId,
          trackTitle,
          category,
          duration,
          userAgent,
          ipAddress,
        } = activity;

        // 필수 필드 검증
        if (!sessionId || !action) {
          continue; // 잘못된 데이터는 건너뛰기
        }

        try {
          const created = await tx.userActivity.create({
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
          createdActivities.push(created);
        } catch (error) {
          console.error("활동 저장 실패:", error);
          // 개별 실패는 무시하고 계속 진행
        }
      }

      return createdActivities;
    }, {
      maxWait: 5000, // 최대 대기 시간 5초
      timeout: 10000, // 트랜잭션 타임아웃 10초
    });

    return NextResponse.json(
      { 
        message: "활동이 성공적으로 저장되었습니다.", 
        savedCount: result.length,
        totalCount: activities.length 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("배치 활동 저장 오류:", error);
    
    // 데이터베이스 연결 오류 처리
    if (error instanceof Error && error.message.includes("connect")) {
      return NextResponse.json(
        { error: "데이터베이스 연결 오류가 발생했습니다." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "활동 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    // Prisma 연결 정리 (중요!)
    await prisma.$disconnect();
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}