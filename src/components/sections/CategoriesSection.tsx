"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useScrollTracking } from "@/hooks/useScrollTracking";
import { trackMediaPlay } from "@/lib/gtag";

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
  const sectionRef = useScrollTracking({ 
    sectionName: 'categories_section',
    threshold: 0.3 
  });
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const audioHandlersRef = useRef<{
    loadstart?: () => void;
    ended?: () => void;
    error?: (e: Event) => void;
  }>({});

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

  // 오디오 안전하게 정리하는 함수
  const cleanupAudio = (audio: HTMLAudioElement) => {
    try {
      // 이벤트 리스너 제거
      const handlers = audioHandlersRef.current;
      if (handlers.loadstart) {
        audio.removeEventListener("loadstart", handlers.loadstart);
      }
      if (handlers.ended) {
        audio.removeEventListener("ended", handlers.ended);
      }
      if (handlers.error) {
        audio.removeEventListener("error", handlers.error);
      }

      // 오디오 정지 및 리소스 해제
      if (!audio.paused) {
        audio.pause();
      }

      // currentTime 설정 전에 잠시 대기하여 상태 충돌 방지
      setTimeout(() => {
        try {
          audio.currentTime = 0;
          audio.src = "";
          audio.load(); // 리소스 완전 해제
        } catch (error) {
          // currentTime 설정 실패 시 무시 (이미 해제된 상태일 수 있음)
          console.debug("Audio cleanup warning:", error);
        }
      }, 10);

      // 핸들러 참조 정리
      audioHandlersRef.current = {};
    } catch (error) {
      console.debug("Audio cleanup warning:", error);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (currentAudio) {
        cleanupAudio(currentAudio);
      }
    };
  }, [currentAudio]);

  const handlePlay = (index: number) => {
    // 현재 재생 중인 오디오 정지
    if (currentAudio) {
      cleanupAudio(currentAudio);
    }

    if (playingIndex === index) {
      // 같은 오디오 클릭 시 정지
      setPlayingIndex(null);
      setCurrentAudio(null);
    } else {
      // 새로운 오디오 재생
      const audio = new Audio(categories[index].sample);
      audio.volume = 0.7;

      // 이벤트 리스너들을 함수로 분리하여 나중에 제거할 수 있도록 함
      const handleLoadStart = () => {
        setPlayingIndex(index);
        // GA 이벤트 추적
        trackMediaPlay(categories[index].title, 'audio');
      };

      const handleEnded = () => {
        setPlayingIndex(null);
        setCurrentAudio(null);
      };

      const handleError = (e: Event) => {
        console.warn("오디오 재생 중 문제가 발생했습니다:", e.type);
        setPlayingIndex(null);
        setCurrentAudio(null);
      };

      // 핸들러 참조 저장
      audioHandlersRef.current = {
        loadstart: handleLoadStart,
        ended: handleEnded,
        error: handleError,
      };

      audio.addEventListener("loadstart", handleLoadStart);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      setCurrentAudio(audio);

      audio.play().catch((error) => {
        console.warn("오디오 재생을 시작할 수 없습니다:", error.message);
        setPlayingIndex(null);
        setCurrentAudio(null);
      });
    }
  };

  return (
    <section
      ref={(el) => {
        // 기존 ref와 스크롤 추적 ref 모두 적용
        (ref as any).current = el;
        (sectionRef as any).current = el;
      }}
      className="section bg-black text-white flex-col px-6 md:px-12"
    >
      <div className="max-w-4xl w-full">
        <motion.h2
          className="text-section-title-mobile md:text-section-title font-black text-center mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          고품질의 팟캐스트를 들어보세요
        </motion.h2>

        <div className="space-y-6 md:space-y-8 lg:space-y-12">
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
