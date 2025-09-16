import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 사용자의 현재 요금제 확인
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        plan: true,
        interestedCategories: {
          select: {
            id: true,
            categoryId: true,
            category: {
              select: {
                isFree: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.plan !== 'pro') {
      return NextResponse.json(
        { error: "User is not on pro plan" },
        { status: 400 }
      );
    }

    // 트랜잭션으로 요금제 취소 처리
    await prisma.$transaction(async (tx) => {
      // 1. 사용자 요금제를 무료로 변경
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: 'free',
        },
      });

      // 2. 프리미엄 카테고리 관심 목록 제거
      const premiumCategories = user.interestedCategories.filter(
        (ic) => !ic.category.isFree
      );

      if (premiumCategories.length > 0) {
        await tx.userInterestedCategory.deleteMany({
          where: {
            userId: user.id,
            categoryId: {
              in: premiumCategories.map((ic) => ic.categoryId),
            },
          },
        });
      }

      // 3. 무료 카테고리가 3개를 초과하는 경우, 최신 3개만 유지
      const freeCategories = user.interestedCategories.filter(
        (ic) => ic.category.isFree
      ).sort((a, b) => b.id - a.id); // ID 기준으로 최신순 정렬

      if (freeCategories.length > 3) {
        const categoriesToKeep = freeCategories.slice(0, 3).map(ic => ic.id);
        await tx.userInterestedCategory.deleteMany({
          where: {
            userId: user.id,
            id: {
              notIn: categoriesToKeep,
            },
            category: {
              isFree: true,
            },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Error canceling subscription" },
      { status: 500 }
    );
  }
}