"use client";

import { motion } from "framer-motion";

export default function Waveform() {
  // 고정된 높이 값들로 hydration mismatch 방지
  const heights = [32, 18, 45, 28, 38, 22, 41, 15, 35, 48, 26, 39];

  // 각 바의 애니메이션 설정
  const getAnimationProps = (i: number) => ({
    animate: {
      scaleY: [1, 1.5, 0.8, 1.2, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: i * 0.1,
      repeatType: "loop" as const,
    },
  });

  return (
    <div className="flex items-center justify-center gap-1">
      {heights.map((height, i) => {
        const animationProps = getAnimationProps(i);
        return (
          <motion.div
            key={i}
            className="bg-current rounded-full origin-bottom"
            style={{
              width: "3px",
              height: `${height}px`,
            }}
            animate={animationProps.animate}
            transition={animationProps.transition}
          />
        );
      })}
    </div>
  );
}
