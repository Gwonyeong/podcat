"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker 등록 성공:", registration);
        })
        .catch((error) => {
          console.error("Service Worker 등록 실패:", error);
        });
    }

    // 알림 권한 요청
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return null;
}
