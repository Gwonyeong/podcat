"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useScrollTracking } from "@/hooks/useScrollTracking";

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const sectionRef = useScrollTracking({ 
    sectionName: 'how_it_works_section',
    threshold: 0.3 
  });

  const steps = [
    {
      title: "선택",
      description: "관심 주제를 고르세요",
    },
    {
      title: "생성",
      description: "엄밀하게 중요한 내용만 간결하게",
    },
    {
      title: "청취",
      description: "언제든지 편리하게",
    },
  ];

  return (
    <section
      ref={(el) => {
        // 기존 ref와 스크롤 추적 ref 모두 적용
        (ref as any).current = el;
        (sectionRef as any).current = el;
      }}
      className="section bg-white text-black flex-col px-6 md:px-12"
    >
      <div className="max-w-6xl w-full">
        <motion.h2
          className="text-section-title-mobile md:text-section-title font-black text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          이렇게 사용합니다.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                delay: 0.2 + index * 0.2,
                ease: "easeOut",
              }}
            >
              <div className="mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto border-2 border-black rounded-full flex items-center justify-center mb-6">
                  <span className="text-xl md:text-2xl font-black">
                    {index + 1}
                  </span>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-4">
                {step.title}
              </h3>

              <p className="text-gray-600 text-sm md:text-base">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
