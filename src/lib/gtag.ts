// Google Analytics 설정 및 유틸리티

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// GA가 활성화되어 있는지 확인
export const isGAEnabled = (): boolean => {
  return !!GA_MEASUREMENT_ID && typeof window !== 'undefined' && !!window.gtag;
};

// 페이지뷰 추적
export const pageview = (url: string): void => {
  if (!isGAEnabled()) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_location: url,
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
  if (!isGAEnabled()) return;

  window.gtag('event', action, {
    event_category,
    event_label,
    value,
    ...otherParams,
  });
};

// 스크롤 추적 이벤트
export const trackScroll = (section: string, percentage?: number): void => {
  event('scroll', {
    event_category: 'engagement',
    event_label: section,
    value: percentage,
  });
};

// 버튼 클릭 추적 이벤트
export const trackButtonClick = (buttonName: string, location?: string): void => {
  event('click', {
    event_category: 'button',
    event_label: buttonName,
    button_location: location,
  });
};

// 미디어 재생 추적 이벤트
export const trackMediaPlay = (mediaName: string, mediaType: 'audio' | 'video' = 'audio'): void => {
  event('play', {
    event_category: 'media',
    event_label: mediaName,
    media_type: mediaType,
  });
};

// CTA 버튼 추적 이벤트
export const trackCTAClick = (ctaName: string, section?: string): void => {
  event('cta_click', {
    event_category: 'conversion',
    event_label: ctaName,
    cta_section: section,
  });
};
