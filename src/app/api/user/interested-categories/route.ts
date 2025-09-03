import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
      include: {
        interestedCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const interestedCategories = user.interestedCategories.map(
      (ic) => ic.category
    );

    const response = NextResponse.json({
      interestedCategories,
      plan: user.plan,
    });
    
    // 캐싱 방지 헤더 설정
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error fetching interested categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryIds } = await request.json();

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "Category IDs must be an array" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
      include: {
        interestedCategories: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 무료 요금제는 최대 3개 카테고리만 선택 가능
    if (user.plan === "free" && categoryIds.length > 3) {
      return NextResponse.json(
        {
          error: "Free plan allows maximum 3 categories",
        },
        { status: 400 }
      );
    }

    // 기존 관심 카테고리 삭제
    await prisma.userInterestedCategory.deleteMany({
      where: { userId: user.id },
    });

    // 새로운 관심 카테고리 추가
    if (categoryIds.length > 0) {
      await prisma.userInterestedCategory.createMany({
        data: categoryIds.map((categoryId: number) => ({
          userId: user.id,
          categoryId,
        })),
      });
    }

    // 업데이트된 관심 카테고리 반환
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        interestedCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    const interestedCategories =
      updatedUser?.interestedCategories.map((ic) => ic.category) || [];

    const response = NextResponse.json({
      interestedCategories,
      plan: user.plan,
    });
    
    // 캐싱 방지 헤더 설정
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error updating interested categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
