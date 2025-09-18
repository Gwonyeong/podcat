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
    const { paymentId, cancelAmount, cancelTaxFreeAmount, cancelVatAmount, reason } = body;

    if (!paymentId || !cancelAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: session.user.id,
        status: 'approved',
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or not eligible for cancellation' },
        { status: 404 }
      );
    }

    const cancelResult = await kakaoPayAPI.cancel({
      tid: payment.tid,
      cancelAmount,
      cancelTaxFreeAmount: cancelTaxFreeAmount || 0,
      cancelVatAmount,
    });

    if (!cancelResult.success) {
      await prisma.paymentHistory.create({
        data: {
          paymentId: payment.id,
          userId: session.user.id,
          action: 'cancel',
          amount: cancelAmount,
          errorMessage: cancelResult.error,
        },
      });

      return NextResponse.json(
        { error: cancelResult.error || 'Payment cancellation failed' },
        { status: 500 }
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'cancelled',
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: 'free' },
    });

    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        userId: session.user.id,
        action: 'cancel',
        amount: cancelAmount,
        paymentMethodType: payment.paymentMethodType,
        errorMessage: reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
      canceledAt: cancelResult.canceledAt,
      canceledAmount: cancelResult.canceledAmount,
    });
  } catch (error) {
    console.error('Payment cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partnerOrderId = searchParams.get('partner_order_id');
    const partnerUserId = searchParams.get('partner_user_id');

    if (!partnerOrderId || !partnerUserId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        partnerOrderId,
        partnerUserId,
        status: 'ready',
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'cancelled' },
      });

      await prisma.paymentHistory.create({
        data: {
          paymentId: payment.id,
          userId: payment.userId,
          action: 'cancel',
          errorMessage: 'User cancelled payment',
        },
      });
    }

    return NextResponse.redirect(new URL('/payment/cancel', request.url));
  } catch (error) {
    console.error('Payment cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}