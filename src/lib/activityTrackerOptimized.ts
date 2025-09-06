// 최적화된 사용자 활동 추적 유틸리티
// 디바운싱과 배치 처리를 통해 API 호출을 최소화

interface ActivityData {
  sessionId: string;
  action: string;
  trackId?: number;
  trackTitle?: string;
  category?: string;
  duration?: number;
  userAgent?: string;
  ipAddress?: string;
  timestamp?: number;
}

// 활동 대기열
class ActivityQueue {
  private queue: ActivityData[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly batchSize = 10; // 한 번에 보낼 최대 활동 수
  private readonly debounceDelay = 5000; // 5초 디바운스
  private readonly maxRetries = 3;
  private retryCount = 0;

  // 큐에 활동 추가
  add(activity: ActivityData) {
    // 타임스탬프 추가
    activity.timestamp = Date.now();
    this.queue.push(activity);

    // 큐가 가득 차면 즉시 전송
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      // 아니면 디바운스 타이머 재설정
      this.resetTimer();
    }
  }

  // 타이머 재설정
  private resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, this.debounceDelay);
  }

  // 큐 비우기 및 전송
  async flush() {
    if (this.queue.length === 0) return;

    // 타이머 정리
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 현재 큐 복사 및 초기화
    const activities = [...this.queue];
    this.queue = [];

    try {
      // 배치 전송
      const response = await fetch("/api/activities/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activities }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track activities: ${response.statusText}`);
      }

      // 성공 시 재시도 횟수 초기화
      this.retryCount = 0;
    } catch (error) {
      console.error("활동 추적 배치 전송 실패:", error);

      // 재시도 로직
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`재시도 ${this.retryCount}/${this.maxRetries}...`);
        
        // 실패한 활동들을 다시 큐에 추가 (앞쪽에)
        this.queue = [...activities, ...this.queue];
        
        // 지수 백오프로 재시도
        setTimeout(() => {
          this.flush();
        }, Math.pow(2, this.retryCount) * 1000);
      } else {
        console.error("최대 재시도 횟수 초과. 활동 데이터가 손실될 수 있습니다.");
        this.retryCount = 0;
      }
    }
  }

  // 페이지 종료 시 남은 활동 전송
  sendBeacon() {
    if (this.queue.length === 0) return;

    // sendBeacon API를 사용하여 비동기 전송
    const data = JSON.stringify({ activities: this.queue });
    navigator.sendBeacon("/api/activities/batch", data);
    this.queue = [];
  }
}

// 싱글톤 인스턴스
const activityQueue = new ActivityQueue();

// 페이지 종료 시 남은 활동 전송
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    activityQueue.sendBeacon();
  });

  // 페이지 숨김 시에도 전송 (모바일 브라우저 대응)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      activityQueue.flush();
    }
  });
}

// 세션 ID 생성 (로컬 스토리지 활용)
export const getOrCreateSessionId = (): string => {
  if (typeof window === "undefined") {
    return Math.random().toString(36).substring(2, 15);
  }

  const sessionKey = "podcat_session_id";
  let sessionId = sessionStorage.getItem(sessionKey);

  if (!sessionId) {
    sessionId = 
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(sessionKey, sessionId);
  }

  return sessionId;
};

// 최적화된 활동 추적 함수
export const trackUserActivity = (activityData: Omit<ActivityData, "timestamp">) => {
  // 큐에 추가 (비동기 배치 처리)
  activityQueue.add(activityData);
};

// 뉴스레터 신청 추적 (디바운싱 적용)
export const trackNewsletterSignup = (sessionId: string) => {
  trackUserActivity({
    sessionId,
    action: "newsletter_signup",
    userAgent: navigator.userAgent,
  });
};

// 샘플 재생 추적 (쓰로틀링 적용)
let lastPlayTrackTime = 0;
const playThrottleDelay = 2000; // 2초 쓰로틀

export const trackSamplePlay = (
  sessionId: string,
  trackId: number,
  trackTitle: string,
  category: string,
  duration?: number
) => {
  const now = Date.now();
  if (now - lastPlayTrackTime < playThrottleDelay) {
    return; // 쓰로틀링으로 무시
  }
  lastPlayTrackTime = now;

  trackUserActivity({
    sessionId,
    action: "sample_play",
    trackId,
    trackTitle,
    category,
    duration,
    userAgent: navigator.userAgent,
  });
};

// 샘플 재생 완료 추적
export const trackSamplePlayComplete = (
  sessionId: string,
  trackId: number,
  trackTitle: string,
  category: string,
  duration: number
) => {
  trackUserActivity({
    sessionId,
    action: "sample_play_complete",
    trackId,
    trackTitle,
    category,
    duration,
    userAgent: navigator.userAgent,
  });
};

// 진행률 추적 (쓰로틀링 적용)
let lastProgressTime = 0;
const progressThrottleDelay = 10000; // 10초마다만 진행률 추적

export const trackPlayProgress = (
  sessionId: string,
  trackId: number,
  trackTitle: string,
  category: string,
  currentTime: number,
  duration: number
) => {
  const now = Date.now();
  if (now - lastProgressTime < progressThrottleDelay) {
    return; // 쓰로틀링으로 무시
  }
  lastProgressTime = now;

  const progressPercent = Math.round((currentTime / duration) * 100);
  
  trackUserActivity({
    sessionId,
    action: "play_progress",
    trackId,
    trackTitle,
    category,
    duration: progressPercent,
    userAgent: navigator.userAgent,
  });
};

// 수동으로 큐 비우기 (테스트용)
export const flushActivityQueue = () => {
  activityQueue.flush();
};