'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SubscriptionFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const [countdown, setCountdown] = useState(10);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing_params':
        return '필수 파라미터가 누락되었습니다.';
      case 'subscription_not_found':
        return '구독 정보를 찾을 수 없습니다.';
      case 'approval_failed':
        return '결제 승인에 실패했습니다.';
      case 'internal_error':
        return '서버 내부 오류가 발생했습니다.';
      default:
        return '구독 처리 중 오류가 발생했습니다.';
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/pricing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">구독 실패</h1>
          <p className="text-gray-600">
            구독 처리 중 문제가 발생했습니다.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">
            {getErrorMessage(error)}
          </p>
          {error && (
            <p className="text-red-600 text-xs mt-2 font-mono">
              오류 코드: {error}
            </p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-sm text-gray-600">
            <p>문제가 지속되면 다음을 확인해주세요:</p>
            <ul className="mt-2 text-left space-y-1">
              <li>• 인터넷 연결 상태</li>
              <li>• 결제 수단 확인</li>
              <li>• 브라우저 새로고침 후 재시도</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block"
          >
            다시 시도하기
          </Link>

          <Link
            href="/main"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
          >
            메인으로 이동
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          {countdown > 0 && (
            <p>{countdown}초 후 자동으로 요금제 페이지로 이동합니다.</p>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400">
          문제가 계속 발생하면 고객센터로 문의해주세요.
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SubscriptionFailContent />
    </Suspense>
  );
}