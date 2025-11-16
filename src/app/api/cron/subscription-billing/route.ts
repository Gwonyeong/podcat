import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 크론 작업 인증 확인
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 });
    }

    console.log('정기 결제 처리 시작:', new Date().toISOString());

    // 오늘 청구할 구독 조회 (다음 결제일이 오늘인 활성 구독)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const subscriptionsToCharge = await prisma.subscription.findMany({
      where: {
        status: 'active',
        nextBillingDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            customerKey: true,
            billingKey: true
          }
        },
      },
    });

    console.log(`처리할 구독 수: ${subscriptionsToCharge.length}`);

    const results = [];
    const secretKey = process.env.TOSS_SECRET_KEY;
    const encodedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    for (const subscription of subscriptionsToCharge) {
      try {
        const orderId = `SUB_${subscription.id}_${Date.now()}`;

        console.log(`구독 결제 시작 - 사용자: ${subscription.user.id}, 구독: ${subscription.id}, 금액: ${subscription.amount}`);

        // 토스페이먼츠 자동결제 API 호출
        const response = await fetch(`https://api.tosspayments.com/v1/billing/${subscription.billingKey}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${encodedSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerKey: subscription.user.customerKey,
            amount: subscription.amount,
            orderId: orderId,
            orderName: `Podcat ${subscription.plan} 정기 구독`,
            customerEmail: subscription.user.email,
            customerName: subscription.user.name,
          }),
        });

        const paymentData = await response.json();

        if (response.ok) {
          console.log('구독 결제 성공:', paymentData);

          // 다음 청구일 설정 (1개월 후)
          const nextBillingDate = new Date(subscription.nextBillingDate);
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

          // 구독 정보 업데이트
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              nextBillingDate: nextBillingDate,
              status: 'active'
            },
          });

          // 결제 히스토리 기록 (성공)
          await prisma.paymentHistory.create({
            data: {
              userId: subscription.userId,
              subscriptionId: subscription.id,
              billingKey: subscription.billingKey,
              amount: subscription.amount,
              type: 'subscription',
              status: 'success',
              paymentKey: paymentData.paymentKey,
              orderId: orderId,
            },
          });

          results.push({
            subscriptionId: subscription.id,
            userId: subscription.userId,
            status: 'success',
            amount: subscription.amount,
            nextBillingDate: nextBillingDate.toISOString()
          });

        } else {
          console.error('구독 결제 실패:', paymentData);

          // 결제 히스토리 기록 (실패)
          await prisma.paymentHistory.create({
            data: {
              userId: subscription.userId,
              subscriptionId: subscription.id,
              billingKey: subscription.billingKey,
              amount: subscription.amount,
              type: 'subscription',
              status: 'failed',
              orderId: orderId,
              failReason: paymentData.message || '자동 결제 실패',
            },
          });

          // 결제 실패 시 다음 결제일을 3일 후로 연기 (재시도 로직)
          const retryDate = new Date();
          retryDate.setDate(retryDate.getDate() + 3);

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              nextBillingDate: retryDate
            }
          });

          results.push({
            subscriptionId: subscription.id,
            userId: subscription.userId,
            status: 'failed',
            error: paymentData.message || '자동 결제 실패',
            retryDate: retryDate.toISOString()
          });
        }

        // API 호출 간격 (과도한 요청 방지)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`구독 ${subscription.id} 청구 실패:`, error);

        // 오류 발생 시 결제 히스토리 기록
        const orderId = `SUB_ERROR_${subscription.id}_${Date.now()}`;
        await prisma.paymentHistory.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            billingKey: subscription.billingKey,
            amount: subscription.amount,
            type: 'subscription',
            status: 'failed',
            orderId: orderId,
            failReason: error instanceof Error ? error.message : '알 수 없는 오류',
          },
        });

        results.push({
          subscriptionId: subscription.id,
          userId: subscription.userId,
          status: 'error',
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        });
      }
    }

    console.log('정기 결제 처리 완료:', results);

    return NextResponse.json({
      success: true,
      processedCount: subscriptionsToCharge.length,
      successCount: results.filter(r => r.status === 'success').length,
      failureCount: results.filter(r => r.status !== 'success').length,
      results: results,
    });

  } catch (error) {
    console.error('자동 결제 크론 작업 오류:', error);
    return NextResponse.json({
      success: false,
      error: '자동 결제 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}