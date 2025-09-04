"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/main");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            접근 권한이 없습니다
          </h1>
          
          <p className="text-gray-600 mb-6">
            이 페이지에 접근하려면 관리자 권한이 필요합니다.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push("/main")}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              메인 페이지로 이동
            </button>
            
            <p className="text-sm text-gray-500">
              3초 후 자동으로 메인 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}