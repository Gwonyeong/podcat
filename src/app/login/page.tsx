"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/main");
    }
  }, [status, router]);

  const handleLogin = () => {
    signIn("kakao");
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
        </div>

        {/* 하단 브랜딩 */}
      </div>
    </div>
  );
}
