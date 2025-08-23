"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Eye, Car } from "lucide-react";
import Image from "next/image";

export default function ProblemSolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const problems = [
    {
      icon: Car,
      title: "멀티태스킹의 어려움",
      description: "출퇴근 때, 운전하며 뉴스레터를 확인하기 어려워요.",
    },
    {
      icon: Eye,
      title: "시각적 피로",
      description: "화면에 글이 많아 눈이 쉽게 피로해요.",
    },
    {
      icon: Clock,
      title: "시간 부족",
      description: "긴 텍스트를 읽을 시간을 따로 내기 어려워요.",
    },
  ];

  return (
    <section
      ref={ref}
      className="section relative bg-gray-50 text-black flex-col px-6 md:px-12 overflow-hidden"
      style={{
        backgroundImage: "url(/images/driver-man.jpg)",
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
              텍스트 뉴스레터, 이런 불편함 없으신가요?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto break-keep"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              시간을 들여 눈으로 화면을 보며 읽는&nbsp;것, 쉽지&nbsp;않잖아요.
            </motion.p>
          </motion.div>

          {/* 중앙 원형 이미지 */}
          <motion.div
            className="flex justify-center mb-12 md:mb-16 lg:mb-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/50"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/images/newsletter-read-man.png"
                alt="텍스트 뉴스레터를 읽으며 피로해하는 남성"
                fill
                className="object-cover"
                priority
              />
              {/* 오버레이 효과 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </motion.div>

          {/* 문제점 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {problems.map((problem, index) => (
              <motion.div
                key={problem.title}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50"
                initial={{ opacity: 0, y: 60 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
                }
                transition={{
                  duration: 0.8,
                  delay: 0.6 + index * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -8, scale: 1.03 }}
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
        </div>
      </div>
    </section>
  );
}
