"use client";

import { useState } from "react";

export default function LandingCTASection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      // 실제 신청 로직은 여기에 구현
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="landing-section landing-cta relative overflow-hidden bg-slate-900">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        {/* 메인 CTA */}
        <div className="mb-16 px-4">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight">
            지금 시작하세요
          </h2>
          <p className="text-lg sm:text-2xl md:text-3xl mb-12 text-gray-300 leading-relaxed">
            매일 아침 15분, AI가 큐레이션한 오디오 뉴스레터로
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            하루를 더 스마트하게 시작하세요
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 px-4">
          <button className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110">
            🎧 무료 체험하기
          </button>
          <button className="w-full sm:w-auto border-3 border-white text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-slate-900 transition-all duration-300">
            📰 샘플 뉴스레터 듣기
          </button>
        </div>

        {/* 뉴스레터 구독 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 sm:p-12 max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            얼리 액세스 신청하기
          </h3>
          <p className="text-base sm:text-lg text-gray-300 mb-8">
            오디오 뉴스레터 베타 서비스를 가장 먼저 경험해보세요
          </p>

          {!isSubscribed ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 whitespace-nowrap"
              >
                신청하기
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-white font-semibold">얼리 액세스 신청이 완료되었습니다!</p>
            </div>
          )}
        </div>

        {/* 추가 정보 */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center px-4">
          <div className="text-white">
            <div className="text-4xl mb-4">🎧</div>
            <h4 className="text-lg sm:text-xl font-semibold mb-2">멀티태스킹</h4>
            <p className="text-gray-300 text-sm sm:text-base">운동, 출근길에서 듣기</p>
          </div>
          <div className="text-white">
            <div className="text-4xl mb-4">📰</div>
            <h4 className="text-lg sm:text-xl font-semibold mb-2">핵심 요약</h4>
            <p className="text-gray-300 text-sm sm:text-base">15분 완성 브리핑</p>
          </div>
          <div className="text-white">
            <div className="text-4xl mb-4">🤖</div>
            <h4 className="text-lg sm:text-xl font-semibold mb-2">AI 큐레이션</h4>
            <p className="text-gray-300 text-sm sm:text-base">개인 맞춤 선별</p>
          </div>
        </div>
      </div>
    </section>
  );
}
