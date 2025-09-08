"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "오디오 콘텐츠", href: "/admin" },
    { name: "카테고리 관리", href: "/admin/categories" },
    { name: "자동 생성기", href: "/admin/scheduler" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            어드민 대시보드
          </h1>

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm
                      ${
                        isActive
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="bg-white shadow rounded-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}
