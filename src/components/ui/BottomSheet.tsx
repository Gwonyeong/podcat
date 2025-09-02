"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: "default" | "audio-detail" | "playlist";
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title = "재생 컨트롤",
  variant = "default",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // 바디 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 46 }}
        onClick={onClose}
      />

      {/* 하단 닫기 버튼 */}
      {variant === "audio-detail" && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2"
          style={{ zIndex: 51 }}
        >
          <button
            onClick={onClose}
            className="w-12 h-12 bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <X size={24} className="text-white" />
          </button>
        </div>
      )}

      {/* 모달 */}
      <div
        ref={sheetRef}
        className={`fixed bg-white z-50 transition-all duration-300 ease-out shadow-2xl rounded-xl flex flex-col ${
          variant === "audio-detail"
            ? "inset-4 md:inset-8"
            : variant === "playlist"
            ? "left-4 right-4 md:left-1/2 md:w-full md:max-w-lg h-[60vh] max-h-[600px] md:transform md:-translate-x-1/2"
            : "left-4 right-4 md:left-1/2 md:w-full md:max-w-lg h-[60vh] max-h-[600px] md:transform md:-translate-x-1/2"
        }`}
        style={{
          ...(variant === "audio-detail"
            ? {
                top: "5vh",
                bottom: "100px", // BottomNav 공간 확보
              }
            : {
                top: "50%",
                transform: "translateY(-50%)",
                marginTop: "-32px", // MiniAudioPlayer 높이의 절반만큼 위로
              }),
        }}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 rounded-t-xl">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="모달 닫기"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        )}

        {/* 콘텐츠 */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden rounded-xl"
          style={{ minHeight: 0 }}
        >
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
