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
        subscriptionEndDate: true,
        subscriptionCanceled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 현재 구독 상태 확인
    const now = new Date();
    const isSubscriptionActive = user.plan === 'pro' &&
      (!user.subscriptionEndDate || user.subscriptionEndDate > now);

    if (!isSubscriptionActive) {
      return NextResponse.json(
        { error: "User does not have an active pro subscription" },
        { status: 400 }
      );
    }

    if (user.subscriptionCanceled) {
      return NextResponse.json(
        { error: "Subscription is already canceled" },
        { status: 400 }
      );
    }

    // 구독 취소 표시 (즉시 해지하지 않고 종료일까지 유지)
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        subscriptionCanceled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
      subscriptionEndDate: user.subscriptionEndDate,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Error canceling subscription" },
      { status: 500 }
    );
  }
}