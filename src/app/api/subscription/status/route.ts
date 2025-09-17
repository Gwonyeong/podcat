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

    // 사용자의 활성 구독 조회
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!subscription) {
      return NextResponse.json({
        success: true,
        hasActiveSubscription: false,
        subscription: null
      });
    }

    // 카카오페이에서 실제 구독 상태 조회
    const statusResult = await kakaoPayAPI.subscriptionStatus({
      sid: subscription.sid
    });

    if (!statusResult.success) {
      return NextResponse.json(
        { error: statusResult.error || 'Failed to get subscription status' },
        { status: 500 }
      );
    }

    // 로컬 DB 상태와 카카오페이 상태가 다르면 동기화
    if (statusResult.status === 'INACTIVE' && subscription.status === 'active') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'inactive',
          inactiveReason: 'EXTERNAL_CANCELLATION',
          inactiveAt: new Date()
        }
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          subscriptionCanceled: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      hasActiveSubscription: statusResult.status === 'ACTIVE',
      subscription: {
        id: subscription.id,
        sid: subscription.sid,
        status: statusResult.status,
        itemName: subscription.itemName,
        amount: subscription.amount,
        billingCycle: subscription.billingCycle,
        nextBillingDate: subscription.nextBillingDate,
        lastBillingDate: subscription.lastBillingDate,
        createdAt: subscription.createdAt,
        paymentHistory: subscription.payments
      },
      kakaoPayStatus: statusResult
    });
  } catch (error) {
    console.error('Subscription status error:', error);
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

    const body = await request.json();
    const { sid } = body;

    if (!sid) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        sid,
        userId: session.user.id
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const statusResult = await kakaoPayAPI.subscriptionStatus({ sid });

    if (!statusResult.success) {
      return NextResponse.json(
        { error: statusResult.error || 'Failed to get subscription status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        sid: subscription.sid,
        status: statusResult.status,
        itemName: subscription.itemName,
        amount: subscription.amount,
        nextBillingDate: subscription.nextBillingDate,
        lastBillingDate: subscription.lastBillingDate
      },
      kakaoPayStatus: statusResult
    });
  } catch (error) {
    console.error('Subscription status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}