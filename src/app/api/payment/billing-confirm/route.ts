import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    console.log('빌링키 확인 시작 - 사용자 ID:', session.user.id);

    const { authKey, customerKey } = await request.json();

    if (!authKey || !customerKey) {
      return NextResponse.json({
        error: '필수 파라미터가 누락되었습니다.'
      }, { status: 400 });
    }

    console.log('요청 파라미터:', { authKey: authKey.substring(0, 10) + '...', customerKey });

    // 토스페이먼츠 빌링키 발급 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({
        error: '서버 설정 오류'
      }, { status: 500 });
    }

    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authKey: authKey,
        customerKey: customerKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('토스페이먼츠 빌링키 발급 실패:', errorData);
      return NextResponse.json({
        success: false,
        error: errorData.message || '빌링키 발급 실패'
      }, { status: 400 });
    }

    const billingData = await response.json();

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, plan: true }
    });

    if (!existingUser) {
      console.error('사용자를 찾을 수 없음:', session.user.id);
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    console.log('사용자 확인 성공:', existingUser);

    // 다음 결제일 (한 달 후)
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    try {
      await prisma.$transaction(async (tx) => {
        // 기존 활성 구독이 있다면 취소 처리
        await tx.subscription.updateMany({
          where: {
            userId: session.user.id,
            status: 'active'
          },
          data: {
            status: 'canceled',
            canceledAt: new Date(),
            endedAt: new Date()
          }
        });

        console.log('기존 구독 취소 완료');

        // 사용자 정보 업데이트
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            plan: 'pro',
            billingKey: billingData.billingKey,
            customerKey: customerKey,
            subscriptionCanceled: false,
            subscriptionEndDate: null
          }
        });

        console.log('사용자 정보 업데이트 완료');

        // 새 구독 생성
        const newSubscription = await tx.subscription.create({
          data: {
            userId: session.user.id,
            billingKey: billingData.billingKey,
            customerKey: customerKey,
            plan: 'pro',
            amount: 2900,
            status: 'active',
            nextBillingDate: nextBillingDate
          }
        });

        console.log('새 구독 생성 완료:', newSubscription.id);
      });
    } catch (transactionError) {
      console.error('Prisma 트랜잭션 오류:', transactionError);
      throw transactionError;
    }

    return NextResponse.json({
      success: true,
      billingKey: billingData.billingKey,
      message: '빌링키가 성공적으로 발급되었습니다.'
    });

  } catch (error) {
    console.error('빌링키 확인 오류:', error);

    // Prisma 오류 상세 로깅
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }

    return NextResponse.json({
      success: false,
      error: '빌링키 확인 처리 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}