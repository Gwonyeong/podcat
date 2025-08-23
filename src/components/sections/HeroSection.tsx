"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Waveform from "@/components/ui/Waveform";
import { useScrollTracking } from "@/hooks/useScrollTracking";

export default function HeroSection() {
  const sectionRef = useScrollTracking({
    sectionName: "hero_section",
    threshold: 0.3,
  });

  return (
    <section
      ref={sectionRef}
      className="section relative bg-white text-black flex-col px-6 md:px-12 overflow-hidden"
    >
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing-first.jpg"
          alt="Podcast background"
          fill
          className="object-cover opacity-20"
          priority
        />
        {/* 그라데이션 오버레이 */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" /> */}
      </div>

      <motion.div
        className="text-center max-w-4xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* 로고 */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <Image
            src="/logo.png"
            alt="Podcat Logo"
            width={100}
            height={100}
            className="mx-auto md:w-[120px] md:h-[120px]"
            priority
          />
        </motion.div>

        <h1 className="text-hero-mobile md:text-hero font-black leading-none mb-4 md:mb-6">
          AI가 만드는 매일의 팟캐스트
        </h1>

        <motion.p
          className="text-lg md:text-xl text-gray-700 mb-8 md:mb-12 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          당신만을 위한 맞춤형 콘텐츠
        </motion.p>

        <motion.button
          className="bg-black text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold hover:scale-105 transition-transform duration-200 mb-8 md:mb-16 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            document.getElementById("pricing")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        >
          시작하기
        </motion.button>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Waveform />
        </motion.div>
      </motion.div>

      {/* 스크롤 힌트 */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
      >
        <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center bg-white/20 backdrop-blur-sm">
          <motion.div
            className="w-1 h-2 bg-gray-500 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
