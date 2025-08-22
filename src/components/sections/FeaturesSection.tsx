"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const features = [
    {
      number: "01",
      title: "매일 새롭게 업데이트",
      description: "매일 새로운 고품질 콘텐츠",
    },
    {
      number: "02",
      title: "맞춤형 추천",
      description: "당신의 관심사만 골라서",
    },
    {
      number: "03",
      title: "5분 이내의 가벼운",
      description: "핵심만 간결하게",
    },
    {
      number: "04",
      title: "카카오톡으로 쉽게",
      description: "언제 어디서나",
    },
  ];

  return (
    <section
      ref={ref}
      className="section relative bg-white text-black flex-col px-6 md:px-12 overflow-hidden"
      style={{
        backgroundImage: "url(/images/coffeeInCafeWithYoungGirl.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]"></div>

      {/* 콘텐츠 */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl w-full">
          <motion.h2
            className="text-section-title-mobile md:text-section-title font-black text-center mb-8 md:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            어떻게 다른가
          </motion.h2>

          <div className="space-y-6 md:space-y-8 lg:space-y-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.number}
                className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12"
                initial={{ opacity: 0, x: -30 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.1,
                  ease: "easeOut",
                }}
              >
                <div className="text-4xl md:text-6xl font-black text-gray-200 min-w-fit">
                  {feature.number}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    {feature.description}
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
