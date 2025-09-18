'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
              <svg
                className="w-10 h-10 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            결제가 취소되었습니다
          </h1>
          
          <p className="text-gray-600 mb-6">
            결제를 취소하셨습니다. 언제든지 다시 시도하실 수 있습니다.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/pricing"
              className="block w-full py-3 px-4 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors"
            >
              요금제 다시 보기
            </Link>
            
            <Link
              href="/main"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-md font-semibold hover:bg-gray-200 transition-colors"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}