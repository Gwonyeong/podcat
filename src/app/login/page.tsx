"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/main");
    }
  }, [status, router]);

  const handleLogin = () => {
    signIn("kakao");
  };

  const handleTestLogin = async () => {
    try {
      const response = await fetch("/api/auth/test-login", {
        method: "POST",
      });

      if (response.ok) {
        // 로그인 성공 시 페이지 새로고침으로 세션 갱신
        window.location.href = "/main";
      } else {
        alert("테스트 로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Test login error:", error);
      alert("테스트 로그인 중 오류가 발생했습니다.");
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 로고 */}
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Podcat Logo"
              width={120}
              height={120}
              className="mx-auto rounded-2xl"
            />
          </div>

          {/* 브랜딩 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Podcat에 오신 것을 환영합니다
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              AI가 만드는 개인 맞춤 팟캐스트
              <br />
              당신만의 오디오 콘텐츠를 만나보세요
            </p>
          </div>

          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleLogin}
            className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#391B1B] font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="flex-shrink-0"
            >
              <path d="M12 3C7.03 3 3 6.58 3 10.95c0 2.76 1.82 5.18 4.55 6.56l-1.07 3.95c-.07.26.18.48.41.36L11.22 19c.25.01.51.02.78.02 4.97 0 9-3.58 9-7.95C21 6.58 16.97 3 12 3z" />
            </svg>
            <span>카카오로 시작하기</span>
          </button>

          {/* 구분선 */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 테스트 로그인 버튼 */}
          <button
            onClick={handleTestLogin}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>테스트 계정으로 시작하기</span>
          </button>

          {/* 안내 문구 */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            테스트 계정은 PG 연동 테스트용으로 모든 사용자가 공용으로 사용합니다.
          </p>

          {/* 사업자 정보 푸터 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                사업자등록번호: 467-15-02791
              </p>
              <p className="text-xs text-gray-500 mb-2">
                상호명: 파드켓 | 대표자명: 조권영
              </p>
              <p className="text-xs text-gray-500 mb-2">
                주소: 서울특별시 마포구 월드컵북로 6길 19-10
              </p>
              <p className="text-xs text-gray-500">
                전화번호: 010-5418-3486
              </p>
            </div>
          </div>
        </div>

        {/* 하단 브랜딩 */}
      </div>
    </div>
  );
}
