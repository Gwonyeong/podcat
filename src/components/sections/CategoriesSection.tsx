'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

interface Category {
  title: string;
  description: string;
  sample: string;
}

export default function CategoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const categories: Category[] = [
    {
      title: '글로벌 뉴스',
      description: '세계의 중요한 소식들',
      sample: 'sample-global-news.mp3',
    },
    {
      title: '경제 & 투자',
      description: '돈의 흐름을 읽다',
      sample: 'sample-economy.mp3',
    },
    {
      title: '테크 트렌드',
      description: '미래를 앞서가는 기술',
      sample: 'sample-tech.mp3',
    },
    {
      title: 'K-컬처',
      description: '우리의 문화 이야기',
      sample: 'sample-culture.mp3',
    },
    {
      title: '라이프 스타일',
      description: '더 나은 삶을 위한 팁',
      sample: 'sample-lifestyle.mp3',
    },
  ];

  const handlePlay = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
    } else {
      setPlayingIndex(index);
      // 실제 오디오 재생 로직은 추후 구현
      console.log(`Playing: ${categories[index].sample}`);
    }
  };

  return (
    <section ref={ref} className="section bg-black text-white flex-col px-6 md:px-12">
      <div className="max-w-4xl w-full">
        <motion.h2
          className="text-section-title-mobile md:text-section-title font-black text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          무엇을 들을까
        </motion.h2>

        <div className="space-y-8 md:space-y-12">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              className="flex items-center justify-between border-b border-gray-800 pb-6 md:pb-8 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2 + index * 0.1, 
                ease: 'easeOut' 
              }}
              onClick={() => handlePlay(index)}
              whileHover={{ x: 10 }}
            >
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  {category.description}
                </p>
              </div>
              
              <motion.button
                className="w-12 h-12 md:w-16 md:h-16 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors ml-6"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {playingIndex === index ? (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-current"></div>
                ) : (
                  <div className="w-0 h-0 border-l-[6px] md:border-l-[8px] border-l-current border-t-[4px] md:border-t-[6px] border-t-transparent border-b-[4px] md:border-b-[6px] border-b-transparent ml-1"></div>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
