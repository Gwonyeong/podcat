// Google Tag Manager 설정 및 유틸리티

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

// GTM이 활성화되어 있는지 확인
export const isGTMEnabled = (): boolean => {
  return !!GTM_ID && typeof window !== "undefined" && !!window.dataLayer;
};

// dataLayer에 이벤트 푸시
export const pushToDataLayer = (eventData: Record<string, any>): void => {
  if (!isGTMEnabled()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
};

// 페이지뷰 추적
export const pageview = (url: string): void => {
  pushToDataLayer({
    event: 'page_view',
    page_location: url,
    page_title: document.title,
  });
};

// 이벤트 추적
export const event = (
  action: string,
  {
    event_category,
    event_label,
    value,
    ...otherParams
  }: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  } = {}
): void => {
  pushToDataLayer({
    event: action,
    event_category,
    event_label,
    value,
    ...otherParams,
  });
};

// 스크롤 추적 이벤트
export const trackScroll = (section: string, percentage?: number): void => {
  pushToDataLayer({
    event: "scroll_tracking",
    event_category: "engagement",
    section_name: section,
    visibility_percentage: percentage,
  });
};

// 버튼 클릭 추적 이벤트
export const trackButtonClick = (
  buttonName: string,
  location?: string
): void => {
  pushToDataLayer({
    event: "button_click",
    event_category: "interaction",
    button_name: buttonName,
    button_location: location,
  });
};

// 미디어 재생 추적 이벤트
export const trackMediaPlay = (
  mediaName: string,
  mediaType: "audio" | "video" = "audio"
): void => {
  pushToDataLayer({
    event: "media_play",
    event_category: "media",
    media_name: mediaName,
    media_type: mediaType,
  });
};

// CTA 버튼 추적 이벤트
export const trackCTAClick = (ctaName: string, section?: string): void => {
  pushToDataLayer({
    event: "cta_click",
    event_category: "conversion",
    cta_name: ctaName,
    cta_section: section,
  });
};
