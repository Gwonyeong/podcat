"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setVerificationStatus('failed');
        setMessage('결제 정보가 올바르지 않습니다.');
        return;
      }

      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        });

        const result = await response.json();

        if (result.success) {
          setVerificationStatus('success');
          setMessage(result.message || '결제가 완료되었습니다!');
        } else {
          setVerificationStatus('failed');
          setMessage(result.error || '결제 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('결제 검증 실패:', error);
        setVerificationStatus('failed');
        setMessage('결제 검증 중 오류가 발생했습니다.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoToMyPage = () => {
    router.push('/my');
  };

  const handleGoToMain = () => {
    router.push('/main');
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">결제를 확인하고 있습니다</h2>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 완료!</h1>
          <p className="text-gray-600 mb-6 break-keep leading-relaxed">{message}</p>

          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">🎉 프리미엄 혜택</h3>
            <ul className="text-sm text-indigo-700 space-y-1 text-left">
              <li>✓ 프리미엄 전용 8개 카테고리</li>
              <li>✓ 무제한 카테고리 선택</li>
              <li>✓ 매일 새로운 프리미엄 콘텐츠</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoToMyPage}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              마이페이지로 이동
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 실패</h1>
        <p className="text-gray-600 mb-6 break-keep leading-relaxed">{message}</p>

        <div className="space-y-3">
          <button
            onClick={handleGoToMyPage}
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