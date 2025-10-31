import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({
        error: '필수 파라미터가 누락되었습니다.'
      }, { status: 400 });
    }

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({
        error: '서버 설정 오류'
      }, { status: 500 });
    }

    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const payment = await response.json();

    if (response.ok) {
      // 결제 성공 - 사용자 플랜 업데이트
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: 'pro'
        }
      });

      // 결제 내역 저장 (필요시 구현)
      // await prisma.paymentHistory.create({
      //   data: {
      //     userId: session.user.id,
      //     paymentKey,
      //     orderId,
      //     amount,
      //     method: payment.method,
      //     status: payment.status,
      //     approvedAt: new Date(payment.approvedAt)
      //   }
      // });

      return NextResponse.json({
        success: true,
        payment,
        message: '결제가 완료되었습니다. 프리미엄 서비스를 이용하실 수 있습니다.'
      });
    } else {
      console.error('토스페이먼츠 승인 실패:', payment);
      return NextResponse.json({
        success: false,
        error: payment.message || '결제 승인 실패'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('결제 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: '결제 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}