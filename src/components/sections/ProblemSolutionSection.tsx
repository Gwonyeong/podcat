'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function ProblemSolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="section bg-black text-white flex-col px-6 md:px-12">
      <div className="text-center max-w-4xl">
        {/* 문제 제기 */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-section-title-mobile md:text-section-title font-black leading-tight mb-4">
            정보 과부하 시대
          </h2>
          <p className="text-lg md:text-xl text-gray-300 font-regular">
            시간은 부족하고, 중요한 건 놓치고
          </p>
        </motion.div>

        {/* 솔루션 제시 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">AI 큐레이션</h3>
            <p className="text-gray-400 text-sm md:text-base">
              당신을 위한 맞춤 선별
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">15분 완결</h3>
            <p className="text-gray-400 text-sm md:text-base">
              핵심만 간결하게
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">매일 업데이트</h3>
            <p className="text-gray-400 text-sm md:text-base">
              놓칠 일 없는 최신성
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
