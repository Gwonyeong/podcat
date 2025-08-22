"use client";

import { useEffect, useRef } from "react";
import { trackScroll } from "@/lib/gtag";

interface UseScrollTrackingOptions {
  sectionName: string;
  threshold?: number; // 0.0 ~ 1.0, 섹션이 얼마나 보여야 추적할지
  trackOnce?: boolean; // 한 번만 추적할지 여부
}

export const useScrollTracking = ({
  sectionName,
  threshold = 0.5,
  trackOnce = true,
}: UseScrollTrackingOptions) => {
  const elementRef = useRef<HTMLElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 한 번만 추적하고 이미 추적했다면 리턴
            if (trackOnce && hasTracked.current) return;

            const visibilityRatio = Math.round(entry.intersectionRatio * 100);

            trackScroll(sectionName, visibilityRatio);

            if (trackOnce) {
              hasTracked.current = true;
            }
          }
        });
      },
      {
        threshold,
        rootMargin: "0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [sectionName, threshold, trackOnce]);

  return elementRef;
};
