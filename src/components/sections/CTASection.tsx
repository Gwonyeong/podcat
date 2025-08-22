"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import PricingCard from "@/components/ui/PricingCard";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const pricingPlan = {
    name: "베타 체험",
    price: "무료",
    originalPrice: "월 2,900원",
    period: "",
    description: "지금 바로 모든 기능을 무료로 체험해보세요",
    features: [
      "모든 카테고리 팟캐스트 무제한 청취",
      "카카오톡 간편 접속",
      "개인 맞춤 추천",
      "오프라인 다운로드",
      "광고 없는 청취 경험",
    ],
    isCurrentPlan: true,
    buttonText: "지금 무료로 시작하기",
    buttonVariant: "primary" as const,
  };

  return (
    <section
      id="pricing"
      ref={ref}
      className="section relative bg-white text-black flex-col px-6 md:px-12 overflow-hidden"
      style={{
        backgroundImage: "url(/images/example_player.png)",
        backgroundSize: "auto 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>

      {/* 콘텐츠 */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen py-20">
        {/* 제목 섹션 */}
        <motion.div
          className="text-center max-w-4xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-section-title-mobile md:text-section-title font-black leading-tight mb-6 text-white">
            지금 시작하세요
          </h2>
          <motion.p
            className="text-lg md:text-xl text-white/80 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            베타 기간 동안 모든 기능을 무료로 체험해보세요
          </motion.p>
        </motion.div>

        {/* 요금제 카드 */}
        <div className="flex justify-center max-w-2xl w-full">
          <PricingCard plan={pricingPlan} index={0} isInView={isInView} />
        </div>
      </div>
    </section>
  );
}
