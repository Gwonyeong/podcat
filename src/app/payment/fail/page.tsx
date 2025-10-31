"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  useEffect(() => {
    const message = searchParams.get('message') || '결제 중 오류가 발생했습니다.';
    const code = searchParams.get('code') || '';

    setErrorMessage(message);
    setErrorCode(code);
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/my');
  };

  const handleGoToMain = () => {
    router.push('/main');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 실패</h1>
        <p className="text-gray-600 mb-2 break-keep leading-relaxed">{errorMessage}</p>
        {errorCode && (
          <p className="text-sm text-gray-400 mb-6">오류 코드: {errorCode}</p>
        )}

        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-orange-900 mb-2">💡 확인사항</h3>
          <ul className="text-sm text-orange-700 space-y-1 text-left">
            <li>• 카드 한도 및 잔액을 확인해주세요</li>
            <li>• 카드 정보를 정확히 입력했는지 확인해주세요</li>
            <li>• 해외결제가 차단되어 있지 않은지 확인해주세요</li>
            <li>• 다른 결제 수단을 이용해보세요</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            다시 시도하기
          </button>
          <button
            onClick={handleGoToMain}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            메인으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}