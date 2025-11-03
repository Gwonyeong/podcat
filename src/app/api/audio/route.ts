import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // 디버그 모드 체크
    const { searchParams } = new URL(req.url);
    const debug = searchParams.get("debug") === "true";

    if (debug) {
      console.log("Debug mode: Starting API call");
      console.log("Database URL exists:", !!process.env.DATABASE_URL);
      console.log("Node environment:", process.env.NODE_ENV);

      // 데이터베이스 연결 테스트
      try {
        console.log("Testing database connection...");
        const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
        console.log("Database connection successful:", testQuery);
      } catch (dbError) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({
          error: "Database connection failed",
          details: (dbError as Error)?.message,
          stack: process.env.NODE_ENV === "development" ? (dbError as Error)?.stack : undefined
        }, { status: 500 });
      }
    }

    // 인증 확인
    const session = await getServerSession(authOptions);

    if (debug) {
      console.log("Session check result:", !!session);
      console.log("Session user ID:", session?.user?.id);
    }

    if (!session?.user?.id) {
      console.error("No session or user ID found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Session user ID:", session.user.id);

    const date = searchParams.get("date"); // 선택된 날짜 (YYYY-MM-DD 형식)

    // 유저의 관심 카테고리 가져오기
    console.log("Fetching user interested categories...");
    const userInterestedCategories =
      await prisma.userInterestedCategory.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          categoryId: true,
        },
      });
    console.log("Found interested categories:", userInterestedCategories.length);

    const interestedCategoryIds = userInterestedCategories.map(
      (uc) => uc.categoryId
    );

    // where 조건을 무료 콘텐츠 + 관심 카테고리로 수정
    const categoryFilter = interestedCategoryIds.length > 0 ? {
      OR: [
        {
          category: {
            isFree: true // 무료 콘텐츠는 모든 사용자가 접근 가능
          }
        },
        {
          categoryId: {
            in: interestedCategoryIds // 관심 카테고리
          }
        }
      ]
    } : {
      category: {
        isFree: true // 관심 카테고리가 없으면 무료 콘텐츠만
      }
    };

    // 날짜 조건 설정
    let publishDateFilter;
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      publishDateFilter = {
        gte: selectedDate,
        lt: nextDay,
        lte: new Date(), // 여전히 오늘 이하만
      };
    } else {
      publishDateFilter = {
        lte: new Date(), // 오늘 날짜 이하만 (미래 오디오 제외)
      };
    }

    const whereClause = {
      publishDate: publishDateFilter,
      ...categoryFilter
    };

    console.log("Querying audios with whereClause:", JSON.stringify(whereClause));
    const audios = await prisma.audio.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        publishDate: "desc",
      },
    });
    console.log("Found audios:", audios.length);

    const response = NextResponse.json(audios);

    // 캐싱 방지 헤더 설정 (강화)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('ETag', `"${Date.now()}"`); // 매번 다른 ETag로 캐시 무효화
    response.headers.set('Last-Modified', new Date().toUTCString());
    
    return response;
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching audios - Full error:", error);
    console.error("Error name:", err?.name);
    console.error("Error message:", err?.message);
    console.error("Error stack:", err?.stack);

    return NextResponse.json(
      {
        error: "Error fetching audios",
        details: process.env.NODE_ENV === "development" ? err?.message : undefined,
        errorType: err?.name
      },
      { status: 500 }
    );
  }
}
