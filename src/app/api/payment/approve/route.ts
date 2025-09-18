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
    
    if (!pgToken || !partnerOrderId || !partnerUserId) {
      redirect('/payment/fail?error=missing_params');
    }

    const payment = await prisma.payment.findFirst({
      where: {
        partnerOrderId: partnerOrderId,
        partnerUserId: partnerUserId,
        status: 'ready',
      },
    });

    if (!payment) {
      redirect('/payment/fail?error=payment_not_found');
    }

    const approveResult = await kakaoPayAPI.approve({
      tid: payment.tid,
      partnerOrderId: partnerOrderId,
      partnerUserId: partnerUserId,
      pgToken: pgToken,
    });

    if (!approveResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });

      await prisma.paymentHistory.create({
        data: {
          paymentId: payment.id,
          userId: payment.userId,
          action: 'fail',
          errorMessage: approveResult.error,
        },
      });

      redirect(`/payment/fail?error=${encodeURIComponent(approveResult.error || 'approval_failed')}`);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'approved',
        paymentMethodType: approveResult.paymentMethodType,
        approvedAt: new Date(approveResult.approvedAt!),
      },
    });

    const userPlan = payment.itemName.includes('프리미엄') ? 'pro' : 'free';
    const subscriptionEndDate = userPlan === 'pro'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 후
      : null;

    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        plan: userPlan,
        subscriptionEndDate: subscriptionEndDate,
        subscriptionCanceled: false, // 새 구독 시 취소 상태 리셋
      },
    });

    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        userId: payment.userId,
        action: 'approve',
        amount: payment.totalAmount,
        paymentMethodType: approveResult.paymentMethodType,
        cardInfo: approveResult.cardInfo ? JSON.stringify(approveResult.cardInfo) : undefined,
      },
    });

    redirect(`/payment/success?orderId=${partnerOrderId}`);
  } catch (error) {
    console.error('Payment approve error:', error);
    redirect('/payment/fail?error=internal_error');
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
    const { pgToken, partnerOrderId, partnerUserId } = body;

    if (!pgToken || !partnerOrderId || !partnerUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        partnerOrderId,
        partnerUserId,
        userId: session.user.id,
        status: 'ready',
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const approveResult = await kakaoPayAPI.approve({
      tid: payment.tid,
      partnerOrderId,
      partnerUserId,
      pgToken,
    });

    if (!approveResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });

      await prisma.paymentHistory.create({
        data: {
          paymentId: payment.id,
          userId: session.user.id,
          action: 'fail',
          errorMessage: approveResult.error,
        },
      });

      return NextResponse.json(
        { error: approveResult.error || 'Payment approval failed' },
        { status: 500 }
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'approved',
        paymentMethodType: approveResult.paymentMethodType,
        approvedAt: new Date(approveResult.approvedAt!),
      },
    });

    const userPlan = payment.itemName.includes('프리미엄') ? 'pro' : 'free';
    const subscriptionEndDate = userPlan === 'pro'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 후
      : null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: userPlan,
        subscriptionEndDate: subscriptionEndDate,
        subscriptionCanceled: false, // 새 구독 시 취소 상태 리셋
      },
    });

    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        userId: session.user.id,
        action: 'approve',
        amount: payment.totalAmount,
        paymentMethodType: approveResult.paymentMethodType,
        cardInfo: approveResult.cardInfo ? JSON.stringify(approveResult.cardInfo) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
      plan: userPlan,
      approvedAt: approveResult.approvedAt,
    });
  } catch (error) {
    console.error('Payment approve error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}