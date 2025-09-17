import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kakaoPayAPI } from '@/lib/kakaopay';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pgToken = searchParams.get('pg_token');
    const partnerOrderId = searchParams.get('partner_order_id');
    const partnerUserId = searchParams.get('partner_user_id');
    const sid = searchParams.get('sid');

    if (!pgToken || !partnerOrderId || !partnerUserId || !sid) {
      redirect('/subscription/fail?error=missing_params');
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        sid: sid,
        userId: partnerUserId,
        status: 'pending',
      },
    });

    if (!subscription) {
      redirect('/subscription/fail?error=subscription_not_found');
    }

    const approveResult = await kakaoPayAPI.subscriptionApprove({
      sid: sid,
      partnerOrderId: partnerOrderId,
      partnerUserId: partnerUserId,
      pgToken: pgToken,
    });

    if (!approveResult.success) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'inactive', inactiveReason: 'APPROVE_FAILED' },
      });

      const payment = await prisma.payment.findFirst({
        where: { subscriptionId: subscription.id, status: 'ready' }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'failed' },
        });

        await prisma.paymentHistory.create({
          data: {
            paymentId: payment.id,
            userId: subscription.userId,
            action: 'subscription_fail',
            errorMessage: approveResult.error,
          },
        });
      }

      redirect(`/subscription/fail?error=${encodeURIComponent(approveResult.error || 'approval_failed')}`);
    }

    // 구독 활성화
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1); // 다음 달

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        lastBillingDate: new Date(),
        nextBillingDate: nextBillingDate,
      },
    });

    // 결제 정보 업데이트
    const payment = await prisma.payment.findFirst({
      where: { subscriptionId: subscription.id, status: 'ready' }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'approved',
          paymentMethodType: approveResult.paymentMethodType,
          approvedAt: new Date(approveResult.approvedAt!),
        },
      });

      await prisma.paymentHistory.create({
        data: {
          paymentId: payment.id,
          userId: subscription.userId,
          action: 'subscription_approve',
          amount: subscription.amount,
          paymentMethodType: approveResult.paymentMethodType,
          cardInfo: approveResult.cardInfo ? JSON.stringify(approveResult.cardInfo) : undefined,
        },
      });
    }

    // 사용자 플랜 업데이트
    const userPlan = subscription.itemName.includes('프리미엄') ? 'pro' : 'free';
    const subscriptionEndDate = userPlan === 'pro' ? nextBillingDate : null;

    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        plan: userPlan,
        subscriptionEndDate: subscriptionEndDate,
        subscriptionCanceled: false,
      },
    });

    redirect(`/subscription/success?orderId=${partnerOrderId}`);
  } catch (error) {
    console.error('Subscription approve error:', error);
    redirect('/subscription/fail?error=internal_error');
  }
}

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
    const { pgToken, partnerOrderId, partnerUserId, sid } = body;

    if (!pgToken || !partnerOrderId || !partnerUserId || !sid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        sid,
        userId: session.user.id,
        status: 'pending',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const approveResult = await kakaoPayAPI.subscriptionApprove({
      sid,
      partnerOrderId,
      partnerUserId,
      pgToken,
    });

    if (!approveResult.success) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'inactive', inactiveReason: 'APPROVE_FAILED' },
      });

      return NextResponse.json(
        { error: approveResult.error || 'Subscription approval failed' },
        { status: 500 }
      );
    }

    // 구독 활성화
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        lastBillingDate: new Date(),
        nextBillingDate: nextBillingDate,
      },
    });

    // 사용자 플랜 업데이트
    const userPlan = subscription.itemName.includes('프리미엄') ? 'pro' : 'free';

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: userPlan,
        subscriptionEndDate: nextBillingDate,
        subscriptionCanceled: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription approved successfully',
      plan: userPlan,
      nextBillingDate: nextBillingDate.toISOString(),
    });
  } catch (error) {
    console.error('Subscription approve error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}