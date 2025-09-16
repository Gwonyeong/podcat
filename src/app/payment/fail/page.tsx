'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing_params':
        return '필수 파라미터가 누락되었습니다.';
      case 'payment_not_found':
        return '결제 정보를 찾을 수 없습니다.';
      case 'approval_failed':
        return '결제 승인에 실패했습니다.';
      case 'internal_error':
        return '내부 서버 오류가 발생했습니다.';
      case 'payment_failed':
        return '결제가 실패했습니다.';
      default:
        return errorCode || '알 수 없는 오류가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            결제 실패
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage(error)}
          </p>
          
          <div className="space-y-4">
            <Link
              href="/pricing"
              className="block w-full py-3 px-4 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors"
            >
              다시 시도하기
            </Link>
            
            <Link
              href="/main"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-md font-semibold hover:bg-gray-200 transition-colors"
            >
              메인으로 돌아가기
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            문제가 계속되면 고객센터로 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}