import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('TossPayments 웹훅 수신:', payload);

    // 웹훅 검증 (실제 환경에서는 서명 검증 필요)
    // const signature = request.headers.get('toss-signature');
    // TODO: 웹훅 서명 검증 로직 추가

    switch (payload.eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        if (payload.data.status === 'DONE') {
          await handlePaymentSuccess(payload.data);
        } else if (payload.data.status === 'CANCELED' || payload.data.status === 'FAILED') {
          await handlePaymentFailure(payload.data);
        }
        break;

      case 'BILLING_KEY_DELETED':
        await handleBillingKeyDeleted(payload.data);
        break;

      default:
        console.log('알 수 없는 웹훅 이벤트:', payload.eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('웹훅 처리 오류:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(data: unknown) {
  try {
    const paymentData = data as {
      orderId: string;
      paymentKey: string;
      status: string;
    };
    console.log('결제 성공 처리:', paymentData);

    // orderId로 결제 히스토리 업데이트
    const updatedHistory = await prisma.paymentHistory.updateMany({
      where: {
        orderId: paymentData.orderId,
        status: { in: ['pending', 'failed'] }
      },
      data: {
        status: 'success',
        paymentKey: paymentData.paymentKey,
      },
    });

    // 구독 결제인 경우 다음 결제일 업데이트
    if (paymentData.orderId.startsWith('SUB_')) {
      const paymentHistory = await prisma.paymentHistory.findFirst({
        where: { orderId: paymentData.orderId },
        include: { subscription: true }
      });

      if (paymentHistory?.subscription) {
        const nextBillingDate = new Date(paymentHistory.subscription.nextBillingDate);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        await prisma.subscription.update({
          where: { id: paymentHistory.subscriptionId! },
          data: {
            nextBillingDate: nextBillingDate,
            status: 'active'
          }
        });
      }
    }

    console.log(`결제 성공 처리 완료 - 업데이트된 레코드: ${updatedHistory.count}`);
  } catch (error) {
    console.error('결제 성공 처리 오류:', error);
  }
}

async function handlePaymentFailure(data: unknown) {
  try {
    const failureData = data as {
      orderId: string;
      failure?: { reason?: string };
      failReason?: string;
    };
    console.log('결제 실패 처리:', failureData);

    // 결제 히스토리 업데이트
    const updatedHistory = await prisma.paymentHistory.updateMany({
      where: {
        orderId: failureData.orderId,
      },
      data: {
        status: 'failed',
        failReason: failureData.failure?.reason || failureData.failReason || '결제 실패',
      },
    });

    // 구독 결제 실패 시 처리
    if (failureData.orderId.startsWith('SUB_')) {
      const paymentHistory = await prisma.paymentHistory.findFirst({
        where: { orderId: failureData.orderId },
        include: { subscription: true, user: true }
      });

      if (paymentHistory?.subscription) {
        // 3회 연속 실패 시 구독 일시정지 (필요시 구현)
        // 현재는 실패 로그만 남김
        console.log(`구독 결제 실패 - 사용자: ${paymentHistory.userId}, 구독: ${paymentHistory.subscriptionId}`);
      }
    }

    console.log(`결제 실패 처리 완료 - 업데이트된 레코드: ${updatedHistory.count}`);
  } catch (error) {
    console.error('결제 실패 처리 오류:', error);
  }
}

async function handleBillingKeyDeleted(data: unknown) {
  try {
    const billingData = data as {
      customerKey?: string;
      billingKey?: string;
    };
    console.log('빌링키 삭제 처리:', billingData);

    // 빌링키가 삭제된 사용자 찾기 및 구독 취소
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { customerKey: billingData.customerKey },
          { billingKey: billingData.billingKey }
        ]
      }
    });

    if (user) {
      await prisma.$transaction(async (tx) => {
        // 사용자 빌링 정보 초기화
        await tx.user.update({
          where: { id: user.id },
          data: {
            billingKey: null,
            customerKey: null,
            subscriptionCanceled: true,
            subscriptionEndDate: new Date() // 즉시 종료
          }
        });

        // 활성 구독 취소
        await tx.subscription.updateMany({
          where: {
            userId: user.id,
            status: 'active'
          },
          data: {
            status: 'canceled',
            canceledAt: new Date(),
            endedAt: new Date()
          }
        });
      });

      console.log(`빌링키 삭제 처리 완료 - 사용자: ${user.id}`);
    } else {
      console.log('해당 빌링키의 사용자를 찾을 수 없음:', billingData);
    }
  } catch (error) {
    console.error('빌링키 삭제 처리 오류:', error);
  }
}