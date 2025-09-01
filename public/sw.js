// Service Worker for background audio playback
const CACHE_NAME = "podcat-audio-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/main", "/api/audio"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
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