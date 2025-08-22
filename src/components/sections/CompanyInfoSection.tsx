"use client";

import { motion, AnimatePresence } from "framer-motion";
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

  const faqs: FAQ[] = [];

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

          <p className="text-lg md:text-xl text-gray-300 mb-12">
            내가 원하는 주제로 만드는 매일의 팟캐스트
          </p>
        </motion.div>

        {/* FAQ 섹션 */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-700 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.3 + index * 0.1,
                  ease: "easeOut",
                }}
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

                <AnimatePresence initial={false}>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                        opacity: { duration: 0.2 },
                      }}
                      className="overflow-hidden bg-gray-900"
                    >
                      <motion.div
                        className="px-6 py-4 text-gray-300 leading-relaxed"
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          <h3 className="text-2xl md:text-3xl font-bold mb-8">문의하기</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">📧</div>
              <h4 className="font-semibold mb-2">이메일</h4>
              <p className="text-gray-300">busGwonyeong@gmail.com</p>
            </div>

            {/* <div className="text-center">
              <div className="text-3xl mb-4">💬</div>
              <h4 className="font-semibold mb-2">카카오톡</h4>
              <p className="text-gray-300">준비중입니다.</p>
            </div> */}
          </div>

          <div className="mt-12 p-6 bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-4">비즈니스 문의</h4>
            <p className="text-gray-300 leading-relaxed">
              파트너십, 광고, 기업 서비스에 대한 문의는
              <br />
              <span className="text-white font-semibold">
                busGwonyeong@gmail.com
              </span>
              로 연락주세요.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
