"use client";

import { useState } from "react";

const features = [
  {
    id: 1,
    title: "AI 큐레이션 뉴스레터",
    description:
      "AI가 최신 뉴스와 트렌드를 분석하여 개인 맞춤형 오디오 뉴스레터를 생성합니다.",
    icon: "🤖",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "멀티미디어 경험",
    description:
      "텍스트를 읽을 시간이 없을 때, 귀로 듣는 편리한 정보 습득 방식을 제공합니다.",
    icon: "🎧",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "15분 핵심 요약",
    description:
      "바쁜 현대인을 위한 핵심만 담은 15분 완성 오디오 브리핑을 제공합니다.",
    icon: "⏱️",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    title: "카테고리별 정리",
    description:
      "비즈니스, 테크, 라이프스타일 등 관심 분야별로 정리된 뉴스레터를 제공합니다.",
    icon: "📂",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    title: "개인화 추천",
    description:
      "사용자의 청취 패턴과 관심사를 분석하여 맞춤형 콘텐츠를 추천합니다.",
    icon: "🎯",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: 6,
    title: "매일 새로운 인사이트",
    description:
      "매일 업데이트되는 최신 정보와 인사이트로 항상 트렌드를 앞서갑니다.",
    icon: "📰",
    color: "from-teal-500 to-green-500",
  },
];

export default function LandingFeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section className="landing-section py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            오디오 뉴스레터의 특별함
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            바쁜 일상에서도 놓치지 않는 핵심 정보.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            AI가 만드는 개인 맞춤형 오디오 뉴스레터의 핵심 기능들을 만나보세요.
          </p>
        </div>

        {/* 기능 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`landing-feature group cursor-pointer transform transition-all duration-500 ${
                hoveredFeature === feature.id
                  ? "scale-105 -translate-y-2"
                  : "hover:scale-105"
              }`}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* 아이콘 */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>

              {/* 제목 */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                {feature.title}
              </h3>

              {/* 설명 */}
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                {feature.description}
              </p>

              {/* 호버 효과 */}
              <div
                className={`mt-6 w-0 h-1 bg-gradient-to-r ${feature.color} transition-all duration-300 group-hover:w-full`}
              ></div>
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="mt-20 text-center px-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              지금 바로 오디오 뉴스레터를 경험해보세요
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-8">
              매일 아침, 출근길에서 듣는 15분의 인사이트.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              AI가 큐레이션한 개인 맞춤형 오디오 뉴스레터를 무료로 체험해보세요.
            </p>
            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              🎧 무료 체험 시작하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
