import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kakaoPayAPI } from '@/lib/kakaopay';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemName, quantity, totalAmount, taxFreeAmount, vatAmount, plan } = body;

    if (!itemName || !quantity || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 이미 활성 구독이 있는지 확인
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: '이미 활성화된 구독이 있습니다.' },
        { status: 409 }
      );
    }

    const partnerOrderId = `SUB_ORDER_${Date.now()}_${session.user.id}`;
    const partnerUserId = session.user.id;

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const approvalUrl = `${baseUrl}/api/subscription/approve`;
    const cancelUrl = `${baseUrl}/subscription/cancel`;
    const failUrl = `${baseUrl}/subscription/fail`;

    const subscriptionResult = await kakaoPayAPI.subscriptionReady({
      partnerOrderId,
      partnerUserId,
      itemName,
      quantity,
      totalAmount,
      taxFreeAmount: taxFreeAmount || 0,
      vatAmount: vatAmount || 0,
      approvalUrl,
      cancelUrl,
      failUrl,
    });

    if (!subscriptionResult.success || !subscriptionResult.sid) {
      return NextResponse.json(
        { error: subscriptionResult.error || 'Subscription initialization failed' },
        { status: 500 }
      );
    }

    // 구독 정보 저장
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        sid: subscriptionResult.sid,
        cid: process.env.KAKAO_PAY_CID_SUBSCRIPTION || 'TCSUBSCRIP',
        status: 'pending',
        billingCycle: 'monthly',
        amount: totalAmount,
        taxFreeAmount: taxFreeAmount || 0,
        vatAmount: vatAmount || 0,
        itemName,
      },
    });

    // 초기 결제 정보도 저장 (정기결제 첫 승인용)
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        tid: subscriptionResult.tid || `T_${subscriptionResult.sid}`,
        cid: process.env.KAKAO_PAY_CID_SUBSCRIPTION || 'TCSUBSCRIP',
        partnerOrderId,
        partnerUserId,
        itemName,
        quantity,
        totalAmount,
        taxFreeAmount: taxFreeAmount || 0,
        vatAmount: vatAmount || 0,
        status: 'ready',
        paymentType: 'subscription',
        subscriptionId: subscription.id,
      },
    });

    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        userId: session.user.id,
        action: 'subscription_ready',
        amount: totalAmount,
      },
    });

    return NextResponse.json({
      success: true,
      sid: subscriptionResult.sid,
      tid: subscriptionResult.tid,
      nextRedirectPcUrl: subscriptionResult.nextRedirectPcUrl,
      nextRedirectMobileUrl: subscriptionResult.nextRedirectMobileUrl,
      nextRedirectAppUrl: subscriptionResult.nextRedirectAppUrl,
      partnerOrderId,
    });
  } catch (error) {
    console.error('Subscription ready error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}