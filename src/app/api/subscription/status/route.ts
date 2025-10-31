import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 사용자 정보와 구독 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['active', 'canceled']
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const subscription = user.subscriptions[0];

    // 구독 만료 체크 및 자동 다운그레이드
    const now = new Date();
    if (user.subscriptionCanceled && user.subscriptionEndDate && new Date(user.subscriptionEndDate) <= now) {
      // 구독이 만료된 경우 free 플랜으로 다운그레이드
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'free',
          subscriptionCanceled: false,
          subscriptionEndDate: null
        }
      });

      // 업데이트된 상태 반환
      return NextResponse.json({
        plan: 'free',
        subscriptionCanceled: false,
        subscriptionEndDate: null,
        subscription: null
      });
    }

    return NextResponse.json({
      plan: user.plan,
      subscriptionCanceled: user.subscriptionCanceled || false,
      subscriptionEndDate: user.subscriptionEndDate,
      subscription: subscription ? {
        id: subscription.id,
        plan: subscription.plan,
        amount: subscription.amount,
        status: subscription.status,
        nextBillingDate: subscription.nextBillingDate,
        startedAt: subscription.startedAt,
        canceledAt: subscription.canceledAt,
        endedAt: subscription.endedAt
      } : null
    });
  } catch (error) {
    console.error('구독 상태 조회 오류:', error);
    return NextResponse.json({
      error: '구독 상태 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}