'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function MockPaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const tid = searchParams.get('tid');
  const pgToken = searchParams.get('pg_token');
  const partnerOrderId = searchParams.get('partner_order_id');
  const partnerUserId = searchParams.get('partner_user_id');

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (!tid || !pgToken || !partnerOrderId || !partnerUserId) {
      setError('결제 정보가 올바르지 않습니다.');
      setProcessing(false);
      return;
    }

    // Mock 결제 승인 처리
    handleMockPaymentApproval();
  }, [session, tid, pgToken, partnerOrderId, partnerUserId, router]);

  const handleMockPaymentApproval = async () => {
    try {
      // 결제 승인 API 호출
      const response = await fetch('/api/payment/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pgToken,
          partnerOrderId,
          partnerUserId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // 성공 시 성공 페이지로 리다이렉트
        setTimeout(() => {
          router.push(`/payment/success?orderId=${result.partnerOrderId || 'MOCK_ORDER'}`);
        }, 2000);
      } else {
        setError(result.error || '결제 승인에 실패했습니다.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Mock payment approval error:', error);
      setError('결제 처리 중 오류가 발생했습니다.');
      setProcessing(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {processing ? (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                결제를 처리하고 있습니다
              </h1>
              
              <p className="text-gray-600 mb-4">
                잠시만 기다려주세요...
              </p>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  🧪 <strong>테스트 모드</strong><br />
                  실제 결제가 이루어지지 않습니다
                </p>
              </div>
            </>
          ) : (
            <>
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
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                결제 처리 실패
              </h1>
              
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  다시 시도하기
                </button>
                
                <button
                  onClick={() => router.push('/main')}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  메인으로 돌아가기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MockPaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <MockPaymentSuccessContent />
    </Suspense>
  );
}