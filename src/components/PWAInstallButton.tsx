"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    const checkIfInstalled = () => {
      // standalone 모드로 실행 중이면 이미 설치된 것
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        return true;
      }
      
      // iOS Safari의 경우
      if ("standalone" in window.navigator && (window.navigator as any).standalone) {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };

    if (checkIfInstalled()) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // 기본 설치 프롬프트 방지
      e.preventDefault();
      // 나중에 사용할 수 있도록 이벤트 저장
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS Safari의 경우 수동 설치 안내
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        alert(
          "iOS에서 설치하기:\n" +
          "1. Safari 브라우저 하단의 공유 버튼을 탭하세요\n" +
          "2. '홈 화면에 추가'를 선택하세요"
        );
      }
      return;
    }

    // 설치 프롬프트 표시
    await deferredPrompt.prompt();
    
    // 사용자의 선택 대기
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("사용자가 PWA 설치를 수락했습니다");
    } else {
      console.log("사용자가 PWA 설치를 거부했습니다");
    }
    
    // 프롬프트는 한 번만 사용 가능하므로 초기화
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // 이미 설치되었거나 설치 불가능한 경우 버튼을 표시하지 않음
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
      title="앱 설치하기"
    >
      <span>앱 설치</span>
    </button>
  );
}