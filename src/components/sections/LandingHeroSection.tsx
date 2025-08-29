"use client";

import { useState, useEffect } from "react";

export default function LandingHeroSection() {
  const [currentText, setCurrentText] = useState(0);
  const texts = [
    "AI가 만드는",
    "오디오 뉴스레터",
    "귀로 듣는",
    "맞춤형 정보",
    "15분의 인사이트",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <section className="landing-section landing-hero text-white relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-900 to-black">
      {/* 배경 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* 플로팅 요소들 - 모바일에서는 숨김 */}
      <div className="hidden lg:block absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full animate-float"></div>
      <div
        className="hidden lg:block absolute top-40 right-20 w-24 h-24 bg-white/8 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="hidden lg:block absolute bottom-20 left-1/4 w-20 h-20 bg-white/6 rounded-full animate-float"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* 로고 */}
        <div className="mb-8">
          <img
            src="/logo.png"
            alt="Podcat Logo"
            className="w-24 h-24 mx-auto mb-6 filter brightness-0 invert"
          />
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-8 leading-tight">
          <span className="block">Podcat</span>
          <span className="block text-2xl sm:text-4xl md:text-6xl font-medium mt-4">
            {texts[currentText]}
          </span>
        </h1>

        {/* 서브 타이틀 */}
        <p className="text-lg sm:text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
          바쁜 일상 속에서도 놓치지 않는 핵심 정보.
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          AI가 큐레이션한 오디오 뉴스레터를 15분 안에.
        </p>

        {/* CTA 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <button className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            🎧 무료 체험하기
          </button>
          <button className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-slate-900 transition-all duration-300">
            📰 샘플 듣기
          </button>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
