"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface Category {
  title: string;
  description: string;
  sample: string;
  image: string;
  imageAlt: string;
}

export default function CategoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );

  const categories: Category[] = [
    {
      title: "글로벌 뉴스",
      description: "세계의 중요한 소식들",
      sample: "/sample/글로벌 3대 뉴스- 0820.mp3",
      image: "/images/global-namsu.jpg",
      imageAlt: "글로벌 뉴스 진행자",
    },

    {
      title: "테크 트렌드",
      description: "미래를 앞서가는 기술",
      sample: "/sample/테크- 0820.mp3",
      image: "/images/it-baehyun.jpg",
      imageAlt: "테크 전문가",
    },
    {
      title: "라이프 스타일",
      description: "더 나은 삶을 위한 팁",
      sample: "/sample/라이프스타일- 0820.mp3",
      image: "/images/lifestyle-ari.webp",
      imageAlt: "라이프스타일 전문가",
    },
  ];

  // 오디오 정리 함수
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
    };
  }, [currentAudio]);

  const handlePlay = (index: number) => {
    // 현재 재생 중인 오디오 정지
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (playingIndex === index) {
      // 같은 오디오 클릭 시 정지
      setPlayingIndex(null);
      setCurrentAudio(null);
    } else {
      // 새로운 오디오 재생
      const audio = new Audio(categories[index].sample);
      audio.volume = 0.7;

      audio.addEventListener("loadstart", () => {
        setPlayingIndex(index);
      });

      audio.addEventListener("ended", () => {
        setPlayingIndex(null);
        setCurrentAudio(null);
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setPlayingIndex(null);
        setCurrentAudio(null);
      });

      setCurrentAudio(audio);
      audio.play().catch((error) => {
        console.error("Audio play failed:", error);
        setPlayingIndex(null);
        setCurrentAudio(null);
      });
    }
  };

  return (
    <section
      ref={ref}
      className="section bg-black text-white flex-col px-6 md:px-12"
    >
      <div className="max-w-4xl w-full">
        <motion.h2
          className="text-section-title-mobile md:text-section-title font-black text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          고품질의 팟캐스트를 들어보세요
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
                ease: "easeOut",
              }}
              onClick={() => handlePlay(index)}
              whileHover={{ x: 10 }}
            >
              {/* 원형 프로필 이미지 */}
              <div className="flex-shrink-0 mr-4 md:mr-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-white transition-colors">
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

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
