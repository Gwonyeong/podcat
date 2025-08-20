"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

interface FAQ {
  question: string;
  answer: string;
}

export default function CompanyInfoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "Podcat은 어떤 서비스인가요?",
      answer: "Podcat은 AI 기술을 활용하여 매일 새로운 팟캐스트 콘텐츠를 생성하는 플랫폼입니다. 사용자의 관심사에 맞춘 맞춤형 오디오 콘텐츠를 제공합니다."
    },
    {
      question: "팟캐스트는 얼마나 자주 업데이트되나요?",
      answer: "모든 카테고리의 팟캐스트가 매일 업데이트됩니다. 최신 정보와 트렌드를 반영한 새로운 에피소드를 매일 만나보실 수 있습니다."
    },
    {
      question: "무료로 이용할 수 있나요?",
      answer: "현재 모든 샘플 콘텐츠를 무료로 제공하고 있습니다. 향후 프리미엄 기능이 추가될 예정이지만, 기본적인 청취 기능은 계속 무료로 제공할 계획입니다."
    },
    {
      question: "어떤 주제의 팟캐스트를 들을 수 있나요?",
      answer: "현재 글로벌 뉴스, 테크 트렌드, 라이프 스타일 세 가지 카테고리를 제공하고 있으며, 사용자 피드백을 바탕으로 새로운 카테고리를 지속적으로 추가할 예정입니다."
    },
    {
      question: "팟캐스트 길이는 어느 정도인가요?",
      answer: "각 에피소드는 바쁜 일상 속에서도 쉽게 들을 수 있도록 10-15분 내외로 제작됩니다. 핵심 정보만 간결하게 전달합니다."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section
      ref={ref}
      className="section bg-black text-white flex-col px-6 md:px-12"
    >
      <div className="max-w-4xl w-full">
        {/* 회사 로고 및 소개 */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Podcat Logo"
              width={100}
              height={100}
              className="mx-auto"
            />
          </div>
          <h2 className="text-section-title-mobile md:text-section-title font-black mb-6">
            Podcat
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12">
            AI가 만드는 매일의 팟캐스트
          </p>
        </motion.div>

        {/* FAQ 섹션 */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            자주 묻는 질문
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-700 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: "easeOut" }}
              >
                <button
                  className="w-full px-6 py-4 text-left hover:bg-gray-800 transition-colors flex justify-between items-center"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <motion.span
                    className="text-xl"
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </button>
                
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: openFAQ === index ? "auto" : 0,
                    opacity: openFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-gray-300 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 연락처 정보 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            문의하기
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">📧</div>
              <h4 className="font-semibold mb-2">이메일</h4>
              <p className="text-gray-300">hello@podcat.ai</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-4">💬</div>
              <h4 className="font-semibold mb-2">카카오톡</h4>
              <p className="text-gray-300">@podcat_official</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-4">📱</div>
              <h4 className="font-semibold mb-2">인스타그램</h4>
              <p className="text-gray-300">@podcat.ai</p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-4">비즈니스 문의</h4>
            <p className="text-gray-300 leading-relaxed">
              파트너십, 광고, 기업 서비스에 대한 문의는<br />
              <span className="text-white font-semibold">business@podcat.ai</span>로 연락주세요.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
