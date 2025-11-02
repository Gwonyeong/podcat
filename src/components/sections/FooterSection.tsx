"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function FooterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="section bg-black text-white flex-col px-6 md:px-12"
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="text-sm md:text-base text-gray-400 mb-1">Podcat © 2025</p>
        <p className="text-xs text-gray-500">통신판매업 신고번호: 2025-서울마포-2857</p>
      </motion.div>
    </section>
  );
}
