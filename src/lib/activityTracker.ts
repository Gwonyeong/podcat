// 사용자 활동 추적 유틸리티

// 세션 ID 생성 (간단한 랜덤 문자열)
export const generateSessionId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// 사용자 활동 추적 함수
export const trackUserActivity = async (activityData: {
  sessionId: string;
  action: string;
  trackId?: number;
  trackTitle?: string;
  category?: string;
  duration?: number;
  userAgent?: string;
  ipAddress?: string;
}) => {
  try {
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      console.error("활동 추적 실패:", response.statusText);
    }

    return response.ok;
  } catch (error) {
    console.error("활동 추적 중 오류:", error);
    return false;
  }
};

// 뉴스레터 신청 추적
export const trackNewsletterSignup = async (sessionId: string) => {
  return trackUserActivity({
    sessionId,
    action: "newsletter_signup",
    userAgent: navigator.userAgent,
  });
};

// 샘플 재생 추적
export const trackSamplePlay = async (
  sessionId: string,
  trackId: number,
  trackTitle: string,
  category: string,
  duration?: number
) => {
  return trackUserActivity({
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
export const trackSamplePlayComplete = async (
  sessionId: string,
  trackId: number,
  trackTitle: string,
  category: string,
  duration: number
) => {
  return trackUserActivity({
    sessionId,
    action: "sample_play_complete",
    trackId,
    trackTitle,
    category,
    duration,
    userAgent: navigator.userAgent,
  });
};

// 사용자 활동 조회
export const getUserActivities = async (sessionId: string, action?: string) => {
  try {
    const params = new URLSearchParams({ sessionId });
    if (action) {
      params.append("action", action);
    }

    const response = await fetch(`/api/activities?${params}`);

    if (!response.ok) {
      throw new Error("활동 조회 실패");
    }

    const data = await response.json();
    return data.activities;
  } catch (error) {
    console.error("활동 조회 중 오류:", error);
    return [];
  }
};
