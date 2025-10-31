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

    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.plan !== 'pro') {
      return NextResponse.json({
        error: '프로 요금제 구독이 없습니다.'
      }, { status: 404 });
    }

    // 활성 구독 찾기 (토스페이먼츠 구독)
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    let tossPaymentsSuccess = true;
    let endDate = null;

    // 토스페이먼츠 빌링키 해지 (구독 정보가 있는 경우만)
    if (activeSubscription) {
      const secretKey = process.env.TOSS_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json({
          error: '서버 설정 오류'
        }, { status: 500 });
      }

      const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

      const response = await fetch(`https://api.tosspayments.com/v1/billing/${activeSubscription.billingKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('토스페이먼츠 빌링키 해지 실패:', errorData);
        tossPaymentsSuccess = false;
      }

      endDate = activeSubscription.nextBillingDate;
    }

    // 구독 취소 처리 - 토스페이먼츠 해지 성공 또는 구독 정보가 없는 경우
    if (tossPaymentsSuccess) {
      const canceledAt = new Date();
      const transactions = [];

      // 구독 정보가 있는 경우 상태 업데이트
      if (activeSubscription) {
        transactions.push(
          prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
              status: 'canceled',
              canceledAt: canceledAt,
              endedAt: activeSubscription.nextBillingDate
            }
          })
        );
      }

      // 사용자 정보 업데이트 - plan을 free로 변경
      transactions.push(
        prisma.user.update({
          where: { id: session.user.id },
          data: {
            plan: 'free',
            subscriptionCanceled: activeSubscription ? true : false,
            subscriptionEndDate: endDate
          }
        })
      );

      await prisma.$transaction(transactions);

      return NextResponse.json({
        success: true,
        message: '구독이 취소되었습니다.',
        endDate: endDate
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '구독 취소 처리 중 오류가 발생했습니다.'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('구독 취소 오류:', error);
    return NextResponse.json({
      success: false,
      error: '구독 취소 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}