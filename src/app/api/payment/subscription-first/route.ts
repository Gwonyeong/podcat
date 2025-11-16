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

    console.log('첫 결제 시작 - 사용자 ID:', session.user.id);

    const { customerKey, amount } = await request.json();

    if (!customerKey || !amount) {
      return NextResponse.json({
        error: '필수 파라미터가 누락되었습니다.'
      }, { status: 400 });
    }

    console.log('요청 파라미터:', { customerKey, amount });

    // 사용자의 빌링키 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, billingKey: true, customerKey: true, name: true, email: true }
    });

    if (!user) {
      console.error('사용자를 찾을 수 없음:', session.user.id);
      return NextResponse.json({
        error: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    if (!user.billingKey) {
      console.error('빌링키가 없음:', session.user.id);
      return NextResponse.json({
        error: '빌링키를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    console.log('사용자 정보 확인:', { id: user.id, billingKey: user.billingKey.substring(0, 10) + '...' });

    // 주문 ID 생성
    const orderId = `SUB_INIT_${session.user.id}_${Date.now()}`;

    // 토스페이먼츠 자동결제 API 호출 (첫 결제)
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({
        error: '서버 설정 오류'
      }, { status: 500 });
    }

    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch(`https://api.tosspayments.com/v1/billing/${user.billingKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerKey: user.customerKey,
        amount: amount,
        orderId: orderId,
        orderName: 'Podcat 프로 요금제 정기 구독',
        customerEmail: user.email,
        customerName: user.name,
      }),
    });

    const payment = await response.json();

    if (response.ok) {
      // 결제 성공 - 결제 히스토리 기록
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: 'active'
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log('활성 구독 찾기:', subscription?.id || '없음');

      if (subscription) {
        await prisma.paymentHistory.create({
          data: {
            userId: session.user.id,
            subscriptionId: subscription.id,
            billingKey: user.billingKey,
            amount: amount,
            type: 'subscription',
            status: 'success',
            paymentKey: payment.paymentKey,
            orderId: orderId,
          }
        });
        console.log('결제 히스토리 기록 완료');
      } else {
        console.warn('활성 구독을 찾을 수 없어 결제 히스토리를 기록하지 않음');
      }

      return NextResponse.json({
        success: true,
        payment,
        message: '첫 결제가 완료되었습니다. 프로 요금제 서비스를 이용하실 수 있습니다.'
      });
    } else {
      console.error('토스페이먼츠 자동결제 실패:', payment);

      // 결제 실패 시 구독 취소
      console.log('첫 결제 실패로 인한 구독 취소 진행');

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            plan: 'free',
            billingKey: null,
            customerKey: null
          }
        });

        await tx.subscription.updateMany({
          where: {
            userId: session.user.id,
            status: 'active'
          },
          data: {
            status: 'failed',
            canceledAt: new Date()
          }
        });
      });

      console.log('구독 취소 완료');

      return NextResponse.json({
        success: false,
        error: payment.message || '첫 결제 처리 실패'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('첫 결제 처리 오류:', error);

    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }

    return NextResponse.json({
      success: false,
      error: '첫 결제 처리 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}