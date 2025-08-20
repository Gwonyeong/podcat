'use client';

import { motion } from 'framer-motion';
import Waveform from '@/components/ui/Waveform';

export default function HeroSection() {
  return (
    <section className="section bg-white text-black flex-col px-6 md:px-12">
      <motion.div
        className="text-center max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-hero-mobile md:text-hero font-black leading-none mb-6">
          AI가 만드는<br />
          매일의 팟캐스트
        </h1>
        
        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-12 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          당신만을 위한 맞춤형 콘텐츠
        </motion.p>

        <motion.button
          className="bg-black text-white px-12 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-200 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          시작하기
        </motion.button>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <Waveform />
        </motion.div>
      </motion.div>

      {/* 스크롤 힌트 */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-2 bg-gray-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
