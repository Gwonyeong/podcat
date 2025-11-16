import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 사용자 정보 및 활성 구독 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || user.plan !== 'pro' || !user.subscriptions[0]) {
      return NextResponse.json({
        error: '활성 구독을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    const activeSubscription = user.subscriptions[0];
    const endDate = activeSubscription.nextBillingDate;

    // 토스페이먼츠는 빌링키 삭제 API를 제공하지 않음
    // 구독 해지는 더 이상 해당 빌링키로 결제 요청을 하지 않는 것으로 처리

    // 구독 취소 처리 (빌링키 해지 성공 여부와 관계없이 진행)
    const canceledAt = new Date();

    await prisma.$transaction(async (tx) => {
      // 구독 상태 업데이트
      await tx.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          status: 'canceled',
          canceledAt: canceledAt,
          endedAt: endDate // 다음 결제일까지 서비스 유지
        }
      });

      // 사용자 정보 업데이트
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          subscriptionCanceled: true,
          subscriptionEndDate: endDate,
          billingKey: null, // 빌링키 제거
          customerKey: null // 고객키 제거
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: '구독이 취소되었습니다. 다음 결제일까지 서비스를 계속 이용하실 수 있습니다.',
      endDate: endDate
    });
  } catch (error) {
    console.error('구독 취소 오류:', error);
    return NextResponse.json({
      success: false,
      error: '구독 취소 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}