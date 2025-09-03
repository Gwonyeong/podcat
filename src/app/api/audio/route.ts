import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // 선택된 날짜 (YYYY-MM-DD 형식)

    // 유저의 관심 카테고리 가져오기
    const userInterestedCategories =
      await prisma.userInterestedCategory.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          categoryId: true,
        },
      });

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

    const audios = await prisma.audio.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        publishDate: "desc",
      },
    });

    const response = NextResponse.json(audios);
    
    // 캐싱 방지 헤더 설정
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error fetching audios:", error);
    return NextResponse.json(
      { error: "Error fetching audios" },
      { status: 500 }
    );
  }
}
