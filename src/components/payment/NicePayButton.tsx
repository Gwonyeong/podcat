"use client";

import { useState, useEffect } from "react";

interface NicePayButtonProps {
  amount: number;
  itemName: string;
  plan: string;
  className?: string;
  children: React.ReactNode;
}

interface NicePayConfig {
  clientId: string;
  method: string;
  orderId: string;
  amount: number;
  goodsName: string;
  returnUrl: string;
  mallReserved: string;
  fnError: (result: NicePayResult) => void;
}

interface NicePayResult {
  resultCode: string;
  resultMsg?: string;
  errorMsg?: string;
  tid?: string;
  orderId?: string;
}

declare global {
  interface Window {
    AUTHNICE?: {
      requestPay: (config: NicePayConfig, callback: (result: NicePayResult) => void) => void;
    };
  }
}

export default function NicePayButton({
  amount,
  itemName,
  plan,
  className = "",
  children,
}: NicePayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    // 나이스페이 SDK가 이미 로드되어 있는지 확인
    if (window.AUTHNICE) {
      setIsSDKLoaded(true);
      return;
    }

    // SDK 로드 (테스트용 - 실제로는 나이스페이에서 제공하는 정확한 SDK URL 사용)
    // 현재는 테스트를 위해 SDK 로딩을 시뮬레이션
    setTimeout(() => {
      // 테스트용 모의 AUTHNICE 객체
      window.AUTHNICE = {
        requestPay: (config: NicePayConfig, callback: (result: NicePayResult) => void) => {
          console.log('Test payment request:', config);
          // 테스트용 결제 성공 응답
          setTimeout(() => {
            callback({
              resultCode: "0000",
              resultMsg: "테스트 결제 성공",
              tid: "TEST_TID_" + Date.now(),
              orderId: config.orderId
            });
          }, 2000);
        }
      };
      setIsSDKLoaded(true);
      console.log('Test NicePay SDK simulation loaded');
    }, 1000);

    return () => {};

    /* 실제 SDK 로드 코드 (나이스페이 계정 설정 후 사용)
    const script = document.createElement('script');
    script.src = 'https://pay.nicepay.co.kr/v1/js/';
    script.async = true;

    script.onload = () => {
      console.log('NicePay SDK loaded successfully');
      setIsSDKLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load NicePay SDK');
      alert('결제 모듈 로딩에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.');
    };

    document.head.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      const existingScript = document.querySelector('script[src="https://pay.nicepay.co.kr/v1/js/"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
    */
  }, []);

  const handlePayment = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 나이스페이 SDK 로드 확인
      if (!isSDKLoaded || !window.AUTHNICE) {
        alert("결제 모듈이 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        setIsLoading(false);
        return;
      }

      // 환경 변수 확인
      const clientId = process.env.NEXT_PUBLIC_NICEPAY_CLIENT_ID;
      if (!clientId) {
        alert("결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.");
        setIsLoading(false);
        return;
      }

      // 주문번호 생성 (타임스탬프 + 랜덤)
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 결제 요청 설정
      const paymentConfig = {
        clientId: clientId,
        method: "card", // 결제 수단 (card, bank, vbank 등)
        orderId: orderId,
        amount: amount,
        goodsName: itemName,
        returnUrl: `${window.location.origin}/api/nicepay/callback`,
        mallReserved: JSON.stringify({
          plan: plan,
          userId: "test_user" // 실제로는 세션에서 가져와야 함
        }),
        fnError: function(result: NicePayResult) {
          console.error("결제 오류:", result);
          alert(`결제 중 오류가 발생했습니다: ${result.errorMsg || "알 수 없는 오류"}`);
          setIsLoading(false);
        }
      };

      // 나이스페이 결제창 호출
      window.AUTHNICE.requestPay(paymentConfig, function(result: NicePayResult) {
        console.log("결제 결과:", result);

        if (result.resultCode === "0000") {
          // 결제 성공 - 서버에서 승인 처리
          handlePaymentApproval(result);
        } else {
          // 결제 실패
          alert(`결제가 취소되었습니다: ${result.resultMsg || "사용자 취소"}`);
          setIsLoading(false);
        }
      });

    } catch (error) {
      console.error("결제 처리 중 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const handlePaymentApproval = async (paymentResult: NicePayResult) => {
    try {
      const response = await fetch("/api/nicepay/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tid: paymentResult.tid,
          orderId: paymentResult.orderId,
          amount: amount,
          plan: plan,
          itemName: itemName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("결제가 완료되었습니다!");
        // 결제 완료 후 페이지 새로고침 또는 리다이렉트
        window.location.reload();
      } else {
        alert(`결제 승인 실패: ${result.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("결제 승인 처리 오류:", error);
      alert("결제 승인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !isSDKLoaded}
      className={`${className} ${
        isLoading || !isSDKLoaded ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>결제 진행 중...</span>
        </div>
      ) : !isSDKLoaded ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>결제 모듈 로딩 중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}