'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

interface PaymentButtonProps {
  itemName: string;
  amount: number;
  plan?: 'basic' | 'premium';
  className?: string;
  children: React.ReactNode;
}

export default function PaymentButton({
  itemName,
  amount,
  plan = 'basic',
  className = '',
  children,
}: PaymentButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!session?.user) {
      signIn();
      return;
    }

    // 개발 환경에서 Mock 모드임을 알림
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev && !confirm('🧪 테스트 모드입니다.\n실제 결제가 이루어지지 않습니다.\n\n계속 진행하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/ready', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName,
          quantity: 1,
          totalAmount: amount,
          taxFreeAmount: 0,
          vatAmount: Math.floor(amount / 11),
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '결제 준비 중 오류가 발생했습니다.');
      }

      if (data.success && data.nextRedirectPcUrl) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const redirectUrl = isMobile ? data.nextRedirectMobileUrl : data.nextRedirectPcUrl;
        
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('결제 페이지 URL을 받지 못했습니다.');
        }
      } else {
        throw new Error('결제 초기화에 실패했습니다.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? '처리 중...' : children}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </>
  );
}