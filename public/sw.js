// Service Worker for background audio playback
const CACHE_NAME = "podcat-audio-cache-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 정적 리소스만 미리 캐시 (Next.js 동적 파일 제외)
      return cache.addAll(["/"]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Next.js의 _next 정적 파일들은 캐싱하지 않음 (404 에러 방지)
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(request));
    return;
  }
  
  // API 요청도 캐싱하지 않음
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }
  
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PLAY_AUDIO") {
    // 백그라운드에서 오디오 재생 처리
    const { audioUrl, title } = event.data;

    // 브라우저 알림 표시 (선택사항)
    if ("Notification" in self && Notification.permission === "granted") {
      new Notification("Podcat", {
        body: `현재 재생 중: ${title}`,
        icon: "/logo.png",
        badge: "/logo.png",
      });
    }
  }
});