"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Eye, Car, Smartphone, Brain, Volume2 } from "lucide-react";

export default function ProblemSolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const problems = [
    {
      icon: Car,
      title: "멀티태스킹의 어려움",
      description: "운전이나 다른 일을 하면서 뉴스레터를 확인하기 어려움",
    },
    {
      icon: Eye,
      title: "시각적 피로",
      description: "화면에 글이 많아 눈이 쉽게 피로해짐",
    },
    {
      icon: Clock,
      title: "시간 부족",
      description: "긴 텍스트를 읽을 시간을 따로 내기 어려움",
    },
    {
      icon: Smartphone,
      title: "모바일 가독성",
      description: "작은 화면에서 긴 텍스트 읽기 불편",
    },
    {
      icon: Brain,
      title: "집중력 분산",
      description: "텍스트 읽기 중 다른 생각으로 집중력이 흩어짐",
    },
    {
      icon: Volume2,
      title: "정보 전달의 한계",
      description: "음성의 감정과 뉘앙스를 텍스트로 완전히 전달하기 어려움",
    },
  ];

  return (
    <section
      ref={ref}
      className="section relative bg-gray-50 text-black flex-col px-6 md:px-12 overflow-hidden"
      style={{
        backgroundImage: "url(/images/coffeeInCafeWithYoungGirl.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px]"></div>

      {/* 콘텐츠 */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl w-full">
          {/* 제목 섹션 */}
          <motion.div
            className="text-center mb-12 md:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h2
              className="text-section-title-mobile md:text-section-title font-black mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              텍스트 뉴스레터,
              <br />
              이런 불편함 없으신가요?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              바쁜 일상 속에서 텍스트로 된 뉴스레터를 읽는 것은 생각보다 어려운 일입니다
            </motion.p>
          </motion.div>

          {/* 문제점 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {problems.map((problem, index) => (
              <motion.div
                key={problem.title}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 md:mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <problem.icon 
                      size={32} 
                      className="text-red-500 md:w-10 md:h-10" 
                    />
                  </motion.div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                    {problem.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 해결책 프리뷰 */}
          <motion.div
            className="text-center mt-12 md:mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                🎧 이제 들으면서 정보를 받아보세요!
              </h3>
              <p className="text-base md:text-lg opacity-90">
                Podcat은 이 모든 문제를 해결하는 AI 팟캐스트 서비스입니다
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}