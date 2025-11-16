"use client";

import { useState, useEffect } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useSession } from 'next-auth/react';

interface TossPaymentButtonProps {
  itemName: string;
  amount: number;
  plan: string;
  className?: string;
  children: React.ReactNode;
  isSubscription?: boolean; // 정기 결제 여부
}

interface TossPayments {
  requestPayment: (method: string, options: {
    amount: number;
    orderId: string;
    orderName: string;
    customerName?: string;
    customerEmail?: string;
    successUrl: string;
    failUrl: string;
  }) => Promise<void>;
}

export default function TossPaymentButton({
  itemName,
  amount,
  plan,
  className = "",
  children,
  isSubscription = false
}: TossPaymentButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [tossPayments, setTossPayments] = useState<TossPayments | null>(null);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  useEffect(() => {
    const initializeTossPayments = async () => {
      if (!clientKey) {
        console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.');
        return;
      }

      try {
        const tossPayments = await loadTossPayments(clientKey) as TossPayments;
        setTossPayments(tossPayments);
      } catch (error) {
        console.error('토스페이먼츠 초기화 실패:', error);
      }
    };

    initializeTossPayments();
  }, [clientKey]);

  const handlePayment = async () => {
    if (!tossPayments || !session?.user) {
      alert('결제 준비가 되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSubscription) {
        // 정기 결제 - 빌링키 발급 요청
        const customerKey = `customer_${session.user.id}_${Date.now()}`;

        await tossPayments.requestBillingAuth('카드', {
          customerKey: customerKey,
          successUrl: `${window.location.origin}/payment/billing-success?customerKey=${customerKey}`,
          failUrl: `${window.location.origin}/payment/fail`,
        });
      } else {
        // 일반 결제 요청 (기존 코드)
        const orderId = `PODCAT_${plan.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await tossPayments.requestPayment('카드', {
          amount: amount,
          orderId: orderId,
          orderName: itemName,
          customerName: session.user.name || '사용자',
          customerEmail: session.user.email || '',
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
        });
      }

    } catch (error: unknown) {
      console.error('결제 요청 실패:', error);

      // 사용자가 결제를 취소한 경우
      if (error && typeof error === 'object' && 'code' in error && error.code === 'USER_CANCEL') {
        return; // 별도 알림 없이 종료
      }

      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : '알 수 없는 오류';

      alert(`결제 요청 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        로그인 필요
      </button>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !tossPayments}
      className={`${className} ${
        isLoading || !tossPayments
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:opacity-90'
      } transition-opacity`}
    >
      {isLoading ? (isSubscription ? '구독 등록 중...' : '결제 진행 중...') : children}
    </button>
  );
}