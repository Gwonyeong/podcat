"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="section bg-white text-black flex-col px-6 md:px-12"
    >
      <motion.div
        className="text-center max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-section-title-mobile md:text-section-title font-black leading-tight mb-6">
          지금 시작하세요
        </h2>

        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-12 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          무료로 체험해보세요
        </motion.p>

        <motion.button
          className="bg-black text-white px-16 py-6 text-xl font-semibold hover:scale-105 transition-transform duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          시작하기
        </motion.button>
      </motion.div>
    </section>
  );
}
