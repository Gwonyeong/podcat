'use client';

import PricingCard from '@/components/payment/PricingCard';

export default function PricingPage() {
  const plans = [
    {
      title: '무료',
      price: 0,
      plan: 'free' as const,
      features: [
        '무료 카테고리 2개 접근',
        '테크 트렌드 브리핑',
        '오늘의 명상과 마음챙김',
        '최대 3개 카테고리 선택',
      ],
      highlighted: false,
    },
    {
      title: '프리미엄',
      price: 2900,
      plan: 'premium' as const,
      features: [
        '모든 카테고리 무제한 접근',
        '프리미엄 전용 8개 카테고리',
        '무제한 카테고리 선택',
        '매일 새로운 콘텐츠',
        '광고 없는 청취',
        '다운로드 기능',
      ],
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            요금제 선택
          </h1>
          <p className="text-xl text-gray-600">
            당신에게 맞는 플랜을 선택하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.title}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              highlighted={plan.highlighted}
              plan={plan.plan}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            모든 플랜은 언제든지 취소 가능합니다.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            카카오페이로 안전하게 결제됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}