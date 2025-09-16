'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/main');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            결제가 완료되었습니다!
          </h1>
          
          <p className="text-gray-600 mb-4">
            구독해 주셔서 감사합니다.
          </p>
          
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              주문번호: {orderId}
            </p>
          )}
          
          <div className="space-y-4">
            <Link
              href="/main"
              className="block w-full py-3 px-4 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors"
            >
              메인으로 돌아가기
            </Link>
            
            <Link
              href="/api/payment/status"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-md font-semibold hover:bg-gray-200 transition-colors"
            >
              결제 내역 확인
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            {countdown}초 후 메인 페이지로 이동합니다...
          </p>
        </div>
      </div>
    </div>
  );
}