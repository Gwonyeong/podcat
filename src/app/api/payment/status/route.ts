import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kakaoPayAPI } from '@/lib/kakaopay';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const tid = searchParams.get('tid');

    if (!paymentId && !tid) {
      return NextResponse.json(
        { error: 'Payment ID or TID is required' },
        { status: 400 }
      );
    }

    const where: any = { userId: session.user.id };
    if (paymentId) {
      where.id = paymentId;
    } else if (tid) {
      where.tid = tid;
    }

    const payment = await prisma.payment.findFirst({
      where,
      include: {
        paymentHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const statusResult = await kakaoPayAPI.status({
      tid: payment.tid,
    });

    if (!statusResult.success) {
      return NextResponse.json({
        success: false,
        error: statusResult.error,
        localStatus: payment.status,
        history: payment.paymentHistory,
      });
    }

    if (payment.status !== statusResult.status) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: statusResult.status },
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        tid: payment.tid,
        status: statusResult.status,
        partnerOrderId: payment.partnerOrderId,
        itemName: payment.itemName,
        totalAmount: payment.totalAmount,
        paymentMethodType: statusResult.paymentMethodType,
        approvedAt: payment.approvedAt,
        createdAt: payment.createdAt,
      },
      kakaoPayStatus: {
        amount: statusResult.amount,
        canceledAmount: statusResult.canceledAmount,
        cancelAvailableAmount: statusResult.cancelAvailableAmount,
      },
      history: payment.paymentHistory,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Payment list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}