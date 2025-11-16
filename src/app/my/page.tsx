"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/ui/BottomNav";
import TossPaymentButton from "@/components/payment/TossPaymentButton";

interface InterestedCategory {
  id: number;
  name: string;
  isFree: boolean;
}

interface UserData {
  interestedCategories: InterestedCategory[];
  plan: "free" | "pro";
}

interface SubscriptionData {
  plan: string;
  subscriptionCanceled: boolean;
  subscriptionEndDate: string | null;
  subscription: {
    id: string;
    plan: string;
    amount: number;
    status: string;
    nextBillingDate: string;
    startedAt: string;
    canceledAt: string | null;
    endedAt: string | null;
  } | null;
}

interface ReservedMessage {
  id: number;
  message: string;
  reservedTime: string;
  isActive: boolean;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [interestedCategories, setInterestedCategories] = useState<
    InterestedCategory[]
  >([]);
  const [reservedMessages, setReservedMessages] = useState<ReservedMessage[]>(
    []
  );
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPreparingModal, setShowPreparingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newMessageTime, setNewMessageTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const [categoriesRes, messagesRes, subscriptionRes] = await Promise.all([
        fetch("/api/user/interested-categories"),
        fetch("/api/user/reserved-messages"),
        fetch("/api/subscription/status"),
      ]);

      if (categoriesRes.ok) {
        const categoriesData: UserData = await categoriesRes.json();
        setInterestedCategories(categoriesData.interestedCategories);
        setUserPlan(categoriesData.plan);
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setReservedMessages(messagesData.reservedMessages);
      }

      if (subscriptionRes.ok) {
        const subscriptionData: SubscriptionData = await subscriptionRes.json();
        setSubscriptionData(subscriptionData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (userPlan !== 'pro' || isCanceling) return;

    setIsCanceling(true);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        const message = result.endDate
          ? `구독이 취소되었습니다. ${new Date(result.endDate).toLocaleDateString('ko-KR')}까지 프로 요금제 서비스를 이용하실 수 있습니다.`
          : '구독이 취소되었습니다.';
        alert(message);
        setShowCancelModal(false);
        fetchUserData(); // 데이터 새로고침
      } else {
        alert(`구독 취소 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('구독 취소 오류:', error);
      alert('구독 취소 중 오류가 발생했습니다.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleToggleNotification = async (
    isEnabled: boolean,
    time?: string
  ) => {
    if (!isEnabled) {
      // 알림 끄기 - 모든 예약 메시지 삭제
      try {
        await Promise.all(
          reservedMessages.map((message) =>
            fetch(`/api/user/reserved-messages/${message.id}`, {
              method: "DELETE",
            })
          )
        );
        setReservedMessages([]);
      } catch (error) {
        console.error("Error disabling notifications:", error);
        alert("알림 설정 해제 중 오류가 발생했습니다.");
      }
      return;
    }

    // 알림 켜기 - 시간 설정
    if (!time) {
      alert("시간을 선택해주세요.");
      return;
    }

    try {
      // 기존 알림이 있으면 삭제
      if (reservedMessages.length > 0) {
        await Promise.all(
          reservedMessages.map((message) =>
            fetch(`/api/user/reserved-messages/${message.id}`, {
              method: "DELETE",
            })
          )
        );
      }

      // 새로운 알림 시간 설정
      const [hours, minutes] = time.split(":");
      const notificationTime = new Date();
      notificationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch("/api/user/reserved-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "카카오톡 플레이리스트 알림",
          reservedTime: notificationTime.toISOString(),
        }),
      });

      if (response.ok) {
        fetchUserData();
        setShowMessageModal(false);
        setNewMessageTime("");
      } else {
        alert("알림 설정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error saving notification:", error);
      alert("알림 설정 중 오류가 발생했습니다.");
    }
  };

  const goToCategorySelection = () => {
    router.push("/my/categories");
  };

  if (status === "loading" || isLoading || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {session.user?.name}
              </h2>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
              <div className="mt-2">
                <div className="space-y-1">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      userPlan === "free"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {userPlan === "free" ? "무료 요금제" : "프로 요금제"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 프로 요금제 구독 섹션 - 무료 사용자에게만 표시 */}
        {userPlan === "free" && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 shadow-sm text-white">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">
                프로 요금제로 업그레이드
              </h3>
              <p className="text-sm opacity-90 mb-3">
                모든 카테고리 무제한 접근
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">프로 요금제 전용 8개 카테고리</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">무제한 카테고리 선택</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">매일 새로운 프로 요금제 콘텐츠</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-3xl font-bold">₩2,900</span>
                <span className="text-sm opacity-75">/월</span>
              </div>
            </div>
            <TossPaymentButton
              itemName="프로 요금제 월간 구독"
              amount={2900}
              plan="premium"
              isSubscription={true}
              className="w-full py-3 px-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              정기 구독하기
            </TossPaymentButton>
          </div>
        )}

        {/* 프로 요금제 구독 관리 섹션 - 프로 요금제 사용자에게 표시 */}
        {userPlan === "pro" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                구독 관리
              </h3>
              <div className="flex items-center space-x-2 mb-3">
                <span className="inline-flex px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 font-medium">
                  프로 요금제
                </span>
                {subscriptionData?.subscriptionCanceled && (
                  <span className="inline-flex px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    취소 예정
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {subscriptionData?.subscription && (
                  <p>
                    월 결제 금액: <span className="font-medium">₩{subscriptionData.subscription.amount.toLocaleString()}</span>
                  </p>
                )}
                {subscriptionData?.subscriptionCanceled ? (
                  <div className="space-y-1">
                    <p className="text-orange-600 font-medium">
                      구독이 취소되었습니다
                    </p>
                    <p>
                      서비스 종료일: <span className="font-medium text-orange-600">
                        {subscriptionData.subscriptionEndDate &&
                          new Date(subscriptionData.subscriptionEndDate).toLocaleDateString('ko-KR')
                        }
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      종료일까지 프로 요금제 서비스를 계속 이용하실 수 있습니다.
                    </p>
                  </div>
                  ) : subscriptionData?.subscription ? (
                    <p>
                      다음 결제일: <span className="font-medium">
                        {new Date(subscriptionData.subscription.nextBillingDate).toLocaleDateString('ko-KR')}
                      </span>
                    </p>
                  ) : (
                    <p className="text-gray-500">
                      프로 요금제를 이용 중입니다.
                    </p>
                  )}
                </div>
            </div>

            {/* 구독 취소 버튼 - 프로 요금제 사용자 */}
            {userPlan === 'pro' && !subscriptionData?.subscriptionCanceled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
              >
                구독 취소하기
              </button>
            )}

            {subscriptionData?.subscriptionCanceled && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-orange-800">구독 취소 예정</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      {subscriptionData.subscriptionEndDate &&
                        new Date(subscriptionData.subscriptionEndDate).toLocaleDateString('ko-KR')
                      }까지 프로 요금제 서비스를 계속 이용하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 관심 카테고리 섹션 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              관심 카테고리
            </h3>
            <button
              onClick={goToCategorySelection}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
            >
              편집
            </button>
          </div>
          <div className="space-y-2">
            {interestedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interestedCategories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                관심 카테고리를 설정해주세요.
              </p>
            )}
            {userPlan === "free" && (
              <p className="text-xs text-gray-400 mt-2">
                무료 요금제는 최대 3개 카테고리까지 선택 가능합니다.
              </p>
            )}
          </div>
        </div>

        {/* 카카오톡 알림 섹션 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3.01-.37 4.31-1.02l3.59 1.01c.27.08.55-.11.55-.4v-3.03C21.78 16.72 22 14.4 22 12c0-5.52-4.48-10-10-10zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  카카오톡 알림
                </h3>
                <p className="text-sm text-gray-500 break-keep leading-relaxed">
                  관심 카테고리로 설정한 플레이리스트를
                  <br />
                  카카오톡으로 보내드려요
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reservedMessages.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // 준비중 모달 표시 (기존 코드는 주석으로 보존)
                      setShowPreparingModal(true);
                      // setShowMessageModal(true);  // 추후 기능 구현시 사용
                    } else {
                      handleToggleNotification(false);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {reservedMessages.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      알림 설정됨
                    </p>
                    <p className="text-sm text-blue-700 break-keep leading-relaxed">
                      매일{" "}
                      {new Date(
                        reservedMessages[0].reservedTime
                      ).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      에<br />
                      플레이리스트를 보내드립니다
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const currentTime = new Date(
                      reservedMessages[0].reservedTime
                    );
                    const timeString = currentTime.toLocaleTimeString("en-US", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    setNewMessageTime(timeString);
                    setShowMessageModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  시간 변경
                </button>
              </div>
            </div>
          )}
        </div>


        {/* 로그아웃 버튼 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 준비중 모달 */}
      {showPreparingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3.01-.37 4.31-1.02l3.59 1.01c.27.08.55-.11.55-.4v-3.03C21.78 16.72 22 14.4 22 12c0-5.52-4.48-10-10-10zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                준비중입니다
              </h3>
              <p className="text-sm text-gray-500 break-keep leading-relaxed">
                카카오톡 알림 기능이 곧 제공될 예정입니다.
                <br />
                관심을 가져주셔서 감사합니다!
              </p>
            </div>

            <button
              onClick={() => setShowPreparingModal(false)}
              className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 알림 시간 설정 모달 (추후 기능 구현시 사용) */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3.01-.37 4.31-1.02l3.59 1.01c.27.08.55-.11.55-.4v-3.03C21.78 16.72 22 14.4 22 12c0-5.52-4.48-10-10-10zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                카카오톡 알림 시간 설정
              </h3>
              <p className="text-sm text-gray-500 break-keep leading-relaxed text-center">
                매일 플레이리스트를 받고 싶은
                <br />
                시간을 설정해주세요
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                알림 시간
              </label>
              <div className="flex justify-center">
                <input
                  type="time"
                  value={newMessageTime}
                  onChange={(e) => setNewMessageTime(e.target.value)}
                  className="text-2xl px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setNewMessageTime("");
                }}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
              >
                취소
              </button>
              <button
                onClick={() => handleToggleNotification(true, newMessageTime)}
                className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
              >
                설정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 구독 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                구독을 취소하시겠습니까?
              </h3>
              <p className="text-sm text-gray-500 break-keep leading-relaxed">
                구독을 취소하시면 다음 결제일까지만 프로 요금제 서비스를 이용하실 수 있습니다.
                <br />
                취소 후에도 언제든지 다시 구독하실 수 있습니다.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCanceling ? '처리 중...' : '구독 취소하기'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCanceling}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                계속 이용하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 여백 (네비게이션 바 공간 확보) */}
      <div className="h-20"></div>

      {/* 하단 네비게이션 바 */}
      <BottomNav />
    </div>
  );
}
