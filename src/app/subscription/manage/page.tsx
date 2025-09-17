'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SubscriptionData {
  success: boolean;
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    sid: string;
    status: string;
    itemName: string;
    amount: number;
    billingCycle: string;
    nextBillingDate: string | null;
    lastBillingDate: string | null;
    createdAt: string;
    paymentHistory: Array<{
      id: string;
      status: string;
      totalAmount: number;
      createdAt: string;
    }>;
  } | null;
}

export default function SubscriptionManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchSubscriptionData();
    }
  }, [status, router]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();

      if (response.ok) {
        setSubscriptionData(data);
      } else {
        setError(data.error || '구독 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('정말로 구독을 취소하시겠습니까?\n\n취소 후에는 다음 결제일까지만 서비스를 이용할 수 있습니다.')) {
      return;
    }

    setCanceling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'USER_CANCEL'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('구독이 성공적으로 취소되었습니다.');
        fetchSubscriptionData(); // 데이터 새로고침
      } else {
        alert(data.error || '구독 취소에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 연결에 실패했습니다.');
    } finally {
      setCanceling(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">구독 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubscriptionData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/main"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            메인으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">구독 관리</h1>
          <p className="text-gray-600 mt-2">현재 구독 상태와 결제 이력을 확인하고 관리할 수 있습니다.</p>
        </div>

        {!subscriptionData?.hasActiveSubscription ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">활성 구독이 없습니다</h2>
            <p className="text-gray-600 mb-6">프리미엄 기능을 이용하려면 구독을 시작해보세요.</p>
            <Link
              href="/pricing"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              구독 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 구독 정보 카드 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">현재 구독</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscriptionData.subscription?.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscriptionData.subscription?.status === 'ACTIVE' ? '활성' : '비활성'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">구독 상품</label>
                    <p className="text-lg font-medium">{subscriptionData.subscription?.itemName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">월 결제 금액</label>
                    <p className="text-lg font-medium">₩{subscriptionData.subscription?.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">결제 주기</label>
                    <p className="text-lg font-medium">
                      {subscriptionData.subscription?.billingCycle === 'monthly' ? '월간' : '연간'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">구독 시작일</label>
                    <p className="text-lg font-medium">
                      {subscriptionData.subscription?.createdAt &&
                        new Date(subscriptionData.subscription.createdAt).toLocaleDateString('ko-KR')
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">다음 결제일</label>
                    <p className="text-lg font-medium">
                      {subscriptionData.subscription?.nextBillingDate
                        ? new Date(subscriptionData.subscription.nextBillingDate).toLocaleDateString('ko-KR')
                        : '없음'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">마지막 결제일</label>
                    <p className="text-lg font-medium">
                      {subscriptionData.subscription?.lastBillingDate
                        ? new Date(subscriptionData.subscription.lastBillingDate).toLocaleDateString('ko-KR')
                        : '없음'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {subscriptionData.subscription?.status === 'ACTIVE' && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canceling ? '취소 중...' : '구독 취소'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    구독 취소 시 다음 결제일까지 서비스를 계속 이용할 수 있습니다.
                  </p>
                </div>
              )}
            </div>

            {/* 결제 이력 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">결제 이력</h2>

              {subscriptionData.subscription?.paymentHistory?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">결제일</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">상태</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">금액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {subscriptionData.subscription.paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(payment.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status === 'approved' ? '완료' :
                               payment.status === 'failed' ? '실패' : '대기'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ₩{payment.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">결제 이력이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}