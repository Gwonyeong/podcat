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

    const partnerOrderId = `ORDER_${Date.now()}_${session.user.id}`;
    const partnerUserId = session.user.id;
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const approvalUrl = `${baseUrl}/api/payment/approve`;
    const cancelUrl = `${baseUrl}/payment/cancel`;
    const failUrl = `${baseUrl}/payment/fail`;

    const paymentResult = await kakaoPayAPI.ready({
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

    if (!paymentResult.success || !paymentResult.tid) {
      return NextResponse.json(
        { error: paymentResult.error || 'Payment initialization failed' },
        { status: 500 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        tid: paymentResult.tid,
        cid: process.env.KAKAO_PAY_CID || 'TC0ONETIME',
        partnerOrderId,
        partnerUserId,
        itemName,
        quantity,
        totalAmount,
        taxFreeAmount: taxFreeAmount || 0,
        vatAmount: vatAmount || 0,
        status: 'ready',
      },
    });

    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        userId: session.user.id,
        action: 'ready',
        amount: totalAmount,
      },
    });

    return NextResponse.json({
      success: true,
      tid: paymentResult.tid,
      nextRedirectPcUrl: paymentResult.nextRedirectPcUrl,
      nextRedirectMobileUrl: paymentResult.nextRedirectMobileUrl,
      nextRedirectAppUrl: paymentResult.nextRedirectAppUrl,
      partnerOrderId,
    });
  } catch (error) {
    console.error('Payment ready error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}