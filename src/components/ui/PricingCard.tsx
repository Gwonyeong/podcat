"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

interface PricingCardProps {
  plan: PricingPlan;
  index: number;
  isInView: boolean;
}

export default function PricingCard({
  plan,
  index,
  isInView,
}: PricingCardProps) {
  return (
    <motion.div
      className={`relative bg-white rounded-2xl shadow-xl p-6 md:p-8 ${
        plan.isPopular ? "ring-2 ring-blue-500 scale-105" : ""
      } ${plan.isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      {/* 인기 배지 */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star size={14} fill="white" />
            인기
          </div>
        </div>
      )}

      {/* 현재 플랜 배지 */}
      {plan.isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            현재 무료!
          </div>
        </div>
      )}

      {/* 플랜 이름 */}
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

      {/* 설명 */}
      <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">{plan.description}</p>

      {/* 가격 */}
      <div className="mb-4 md:mb-6">
        {plan.originalPrice && (
          <div className="text-gray-400 line-through text-lg mb-1">
            {plan.originalPrice}
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl md:text-4xl font-bold ${
              plan.isCurrentPlan ? "text-green-600" : "text-gray-900"
            }`}
          >
            {plan.price}
          </span>
          <span className="text-gray-600 text-sm md:text-base">{plan.period}</span>
        </div>
      </div>

      {/* 기능 리스트 */}
      <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-center gap-3">
            <Check
              size={18}
              className={`${
                plan.isCurrentPlan ? "text-green-500" : "text-blue-500"
              } flex-shrink-0`}
            />
            <span className="text-gray-700 text-sm md:text-base">{feature}</span>
          </li>
        ))}
      </ul>

      {/* 버튼 */}
      <button
        className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 ${
          plan.buttonVariant === "primary"
            ? plan.isCurrentPlan
              ? "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
        }`}
      >
        {plan.buttonText}
      </button>
    </motion.div>
  );
}
