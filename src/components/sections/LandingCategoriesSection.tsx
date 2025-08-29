"use client";

import { useState } from "react";

const categories = [
  {
    id: 1,
    name: "글로벌 뉴스",
    description: "세계 각국의 주요 뉴스와 이슈를 AI가 요약하여 제공",
    icon: "🌍",
    color: "from-blue-500 to-cyan-500",
    image: "/images/global-namsu.jpg",
    features: ["실시간 업데이트", "다국어 지원", "객관적 분석"],
  },
  {
    id: 2,
    name: "테크 트렌드",
    description: "최신 기술 동향과 IT 업계 소식을 빠르게 전달",
    icon: "💻",
    color: "from-purple-500 to-pink-500",
    image: "/images/it-baehyun.jpg",
    features: ["기술 트렌드", "스타트업 소식", "AI/ML 동향"],
  },
  {
    id: 3,
    name: "라이프스타일",
    description: "건강, 취미, 문화 등 일상생활의 다양한 이야기",
    icon: "✨",
    color: "from-green-500 to-emerald-500",
    image: "/images/lifestyle-ari.webp",
    features: ["웰빙 정보", "취미 가이드", "문화 트렌드"],
  },
  {
    id: 4,
    name: "비즈니스 인사이트",
    description: "경제, 경영, 투자 등 비즈니스 세계의 인사이트",
    icon: "📈",
    color: "from-orange-500 to-red-500",
    image: "/images/driver-man.jpg",
    features: ["시장 분석", "경영 전략", "투자 정보"],
  },
  {
    id: 5,
    name: "엔터테인먼트",
    description: "영화, 음악, 게임 등 엔터테인먼트 업계 소식",
    icon: "🎬",
    color: "from-indigo-500 to-blue-500",
    image: "/images/example_player.png",
    features: ["신작 소식", "리뷰", "인터뷰"],
  },
  {
    id: 6,
    name: "과학 & 교육",
    description: "과학 연구, 교육 혁신, 학습 방법론 등",
    icon: "🔬",
    color: "from-teal-500 to-green-500",
    image: "/images/coffeeInCafeWithYoungGirl.png",
    features: ["연구 동향", "교육 혁신", "학습 팁"],
  },
];

export default function LandingCategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  return (
    <section className="landing-section py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            다양한 카테고리
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI가 생성하는 맞춤형 팟캐스트를 다양한 카테고리에서 경험해보세요.
            <br />각 카테고리는 독특한 스타일과 콘텐츠로 구성되어 있습니다.
          </p>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`landing-feature group cursor-pointer transform transition-all duration-500 ${
                hoveredCategory === category.id
                  ? "scale-105 -translate-y-2"
                  : "hover:scale-105"
              } ${
                selectedCategory === category.id ? "ring-4 ring-blue-500" : ""
              }`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )
              }
            >
              {/* 카테고리 이미지 */}
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 group-hover:scale-110 transition-transform duration-300">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 카테고리 아이콘 */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {category.icon}
              </div>

              {/* 카테고리 제목 */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                {category.name}
              </h3>

              {/* 카테고리 설명 */}
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 mb-6">
                {category.description}
              </p>

              {/* 카테고리 특징 */}
              <div className="space-y-2">
                {category.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-500"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {feature}
                  </div>
                ))}
              </div>

              {/* 호버 효과 */}
              <div
                className={`mt-6 w-0 h-1 bg-gradient-to-r ${category.color} transition-all duration-300 group-hover:w-full`}
              ></div>
            </div>
          ))}
        </div>

        {/* 선택된 카테고리 상세 정보 */}
        {selectedCategory && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {categories.find((c) => c.id === selectedCategory)?.name}{" "}
                카테고리
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                {categories.find((c) => c.id === selectedCategory)?.description}
              </p>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => setSelectedCategory(null)}
              >
                카테고리 닫기
              </button>
            </div>
          </div>
        )}

        {/* 추가 정보 */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-12 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">
              더 많은 카테고리가 준비 중입니다
            </h3>
            <p className="text-lg text-gray-300 mb-8">
              사용자들의 피드백을 바탕으로 새로운 카테고리를 지속적으로 추가하고
              있습니다. 원하는 카테고리가 있다면 언제든 제안해주세요!
            </p>
            <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
              카테고리 제안하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
