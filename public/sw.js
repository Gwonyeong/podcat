// Service Worker for background audio playback
const CACHE_NAME = "podcat-audio-cache-v4";

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

  // 외부 도메인 요청은 Service Worker가 처리하지 않음
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Next.js의 _next 정적 파일들은 캐싱하지 않음 (404 에러 방지)
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(
      fetch(request).catch((error) => {
        console.error("Failed to fetch _next resource:", error);
        throw error;
      })
    );
    return;
  }

  // API 요청은 캐싱하지 않고 에러 핸들링 추가
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 500 에러 디버깅
          if (!response.ok && response.status === 500) {
            console.error("API 500 error:", url.pathname, response.status);
          }
          return response;
        })
        .catch((error) => {
          console.error("API fetch failed:", url.pathname, error);
          // 네트워크 에러 시 에러 응답 반환
          return new Response(
            JSON.stringify({ error: "Network request failed" }),
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "application/json" }
            }
          );
        })
    );
    return;
  }

  // 기타 요청은 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch((error) => {
        console.error("Fetch failed:", url.pathname, error);
        // 오프라인 페이지나 기본 응답 반환 가능
        return new Response("Offline", { status: 503 });
      });
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