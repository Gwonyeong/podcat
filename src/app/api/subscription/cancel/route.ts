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
    const { reason } = body;

    // 사용자의 활성 구독 찾기
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: '활성화된 구독이 없습니다.' },
        { status: 404 }
      );
    }

    // 카카오페이 정기결제 비활성화
    const inactiveResult = await kakaoPayAPI.subscriptionInactive({
      sid: subscription.sid,
      inactiveReason: reason || 'USER_CANCEL'
    });

    if (!inactiveResult.success) {
      return NextResponse.json(
        { error: inactiveResult.error || 'Failed to cancel subscription' },
        { status: 500 }
      );
    }

    // 구독 상태 업데이트
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'inactive',
        inactiveReason: reason || 'USER_CANCEL',
        inactiveAt: new Date()
      }
    });

    // 사용자 구독 취소 상태 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionCanceled: true
      }
    });

    // 취소 이력 저장
    const cancelPayment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        tid: `CANCEL_${subscription.sid}_${Date.now()}`,
        cid: subscription.cid,
        partnerOrderId: `CANCEL_ORDER_${Date.now()}`,
        partnerUserId: session.user.id,
        itemName: `${subscription.itemName} - 구독 취소`,
        quantity: 1,
        totalAmount: 0,
        status: 'cancelled',
        paymentType: 'subscription',
        subscriptionId: subscription.id,
      }
    });

    await prisma.paymentHistory.create({
      data: {
        paymentId: cancelPayment.id,
        userId: session.user.id,
        action: 'subscription_cancel',
        errorMessage: reason || 'USER_CANCEL'
      }
    });

    return NextResponse.json({
      success: true,
      message: '구독이 성공적으로 취소되었습니다.',
      canceledAt: inactiveResult.inactiveAt,
      lastPaymentAt: inactiveResult.lastPaymentAt
    });
  } catch (error) {
    console.error('Subscription cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}