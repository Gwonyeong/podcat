"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // 임시: Service Worker 비활성화 (문제 해결 시까지)
    const ENABLE_SERVICE_WORKER = false;

    if ("serviceWorker" in navigator) {
      // 기존 Service Worker 모두 제거
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
            console.log("Service Worker 제거됨:", registration.scope);
          });
        });

      // Service Worker가 활성화되어 있을 때만 등록
      if (ENABLE_SERVICE_WORKER) {
        navigator.serviceWorker
          .register("/sw.js", {
            updateViaCache: "none", // 캐시 무시하고 항상 최신 버전 사용
          })
          .then((registration) => {
            console.log("Service Worker 등록 성공:", registration);

            // 업데이트 확인
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "activated") {
                    console.log("Service Worker 업데이트됨");
                    // 필요시 페이지 새로고침
                    if (window.confirm("새 버전이 있습니다. 새로고침하시겠습니까?")) {
                      window.location.reload();
                    }
                  }
                });
              }
            });

            // 즉시 업데이트 확인
            registration.update();
          })
          .catch((error) => {
            console.error("Service Worker 등록 실패:", error);
          });
      }
    }

    // 알림 권한 요청
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return null;
}
