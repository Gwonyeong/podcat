'use client';

import SubscriptionButton from './SubscriptionButton';

interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  highlighted?: boolean;
  plan: 'free' | 'basic' | 'premium';
}

export default function PricingCard({
  title,
  price,
  features,
  highlighted = false,
  plan,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-lg p-6 ${
        highlighted
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl'
          : 'bg-white border border-gray-200 shadow-md'
      }`}
    >
      <h3 className={`text-2xl font-bold mb-4 ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="mb-6">
        {price === 0 ? (
          <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
            무료
          </span>
        ) : (
          <>
            <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
              ₩{price.toLocaleString()}
            </span>
            <span className={`text-sm ${highlighted ? 'text-white/80' : 'text-gray-500'}`}>/월</span>
          </>
        )}
      </div>
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className={`w-5 h-5 mr-2 ${highlighted ? 'text-white' : 'text-green-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className={highlighted ? 'text-white' : 'text-gray-700'}>{feature}</span>
          </li>
        ))}
      </ul>
      {price > 0 && (
        <SubscriptionButton
          itemName={`${title} 월간 구독`}
          amount={price}
          plan={plan === 'basic' ? 'premium' : plan}
          className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
            highlighted
              ? 'bg-white text-purple-600 hover:bg-gray-100'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          정기 구독하기
        </SubscriptionButton>
      )}
      {price === 0 && (
        <div className="w-full py-3 px-4 rounded-md font-semibold text-center bg-gray-100 text-gray-500">
          현재 이용 중
        </div>
      )}
    </div>
  );
}