"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useCallback } from "react";
import { useScrollTracking } from "@/hooks/useScrollTracking";

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const sectionRef = useScrollTracking({
    sectionName: "features_section",
    threshold: 0.3,
  });

  const setRefs = useCallback((element: HTMLElement | null) => {
    (ref as React.MutableRefObject<HTMLElement | null>).current = element;
    sectionRef.current = element;
  }, [ref, sectionRef]);

  const features = [
    {
      number: "01",
      title: "매일 새로운 팟캐스트",
      description: "엄중하게 선정한 주제를 매력적인 보이스로 들어볼 수 있어요.",
    },
    {
      number: "02",
      title: "맞춤형 추천",
      description:
        "내가 선택한 주제를 기반으로 팟캐스트 플레이리스트를 만들어요.",
    },
    {
      number: "03",
      title: "5분 이내 가볍게",
      description: "간결하지만 쉽게 알아들을 수 있게 정리해드릴게요.",
    },
    {
      number: "04",
      title: "카카오톡으로 쉽게",
      description: "내가 원하는 시간, 카카오톡으로 알림을 드릴게요.",
    },
  ];

  return (
    <section
      ref={setRefs}
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
            podcat은 이렇게 해결해요.
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
