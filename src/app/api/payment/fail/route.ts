import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partnerOrderId = searchParams.get('partner_order_id');
    const partnerUserId = searchParams.get('partner_user_id');
    const errorCode = searchParams.get('error_code');
    const errorMessage = searchParams.get('error_msg');

    if (!partnerOrderId || !partnerUserId) {
      return NextResponse.redirect(new URL('/payment/fail?error=missing_params', request.url));
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
        data: { status: 'failed' },
      });

      await prisma.paymentHistory.create({
        data: {
          paymentId: payment.id,
          userId: payment.userId,
          action: 'fail',
          errorCode: errorCode || undefined,
          errorMessage: errorMessage || 'Payment failed',
        },
      });
    }

    return NextResponse.redirect(
      new URL(`/payment/fail?error=${encodeURIComponent(errorMessage || 'payment_failed')}`, request.url)
    );
  } catch (error) {
    console.error('Payment fail handler error:', error);
    return NextResponse.redirect(new URL('/payment/fail?error=internal_error', request.url));
  }
}