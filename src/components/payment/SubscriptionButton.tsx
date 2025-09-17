'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface SubscriptionButtonProps {
  itemName: string;
  amount: number;
  plan?: 'free' | 'premium';
  className?: string;
  children: React.ReactNode;
}

export default function SubscriptionButton({
  itemName,
  amount,
  plan = 'premium',
  className = '',
  children,
}: SubscriptionButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    if (session?.user) {
      checkActiveSubscription();
    } else {
      setCheckingSubscription(false);
    }
  }, [session]);

  const checkActiveSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();

      if (response.ok) {
        setHasActiveSubscription(data.hasActiveSubscription);
      }
    } catch (err) {
      console.error('Failed to check subscription status:', err);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscription = async () => {
    if (!session?.user) {
      signIn();
      return;
    }

    if (hasActiveSubscription) {
      alert('이미 활성화된 구독이 있습니다. 구독 관리 페이지에서 확인해주세요.');
      return;
    }

    // 개발 환경에서 Mock 모드임을 알림
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev && !confirm('🧪 테스트 모드입니다.\n실제 정기결제가 이루어지지 않습니다.\n\n계속 진행하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/ready', {
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
        throw new Error(data.error || '구독 준비 중 오류가 발생했습니다.');
      }

      if (data.success && data.nextRedirectPcUrl) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const redirectUrl = isMobile ? data.nextRedirectMobileUrl : data.nextRedirectPcUrl;

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('구독 페이지 URL을 받지 못했습니다.');
        }
      } else {
        throw new Error('구독 초기화에 실패했습니다.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : '구독 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSubscription) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        확인 중...
      </button>
    );
  }

  if (hasActiveSubscription) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
        title="이미 활성화된 구독이 있습니다"
      >
        구독 중
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleSubscription}
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