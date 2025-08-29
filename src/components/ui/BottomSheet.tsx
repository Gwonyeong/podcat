"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  onOpen,
  children,
  title = "재생 컨트롤",
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
  };

  // 드래그 중
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setCurrentY(e.clientY);
  };

  // 드래그 끝
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;

    if (isOpen && deltaY > 100) {
      // 아래로 100px 이상 드래그하면 닫기
      onClose();
    } else if (!isOpen && deltaY < -50) {
      // 위로 50px 이상 드래그하면 열기
      onOpen();
    }

    setCurrentY(0);
    setStartY(0);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;

    if (isOpen && deltaY > 100) {
      onClose();
    } else if (!isOpen && deltaY < -50) {
      onOpen();
    }

    setCurrentY(0);
    setStartY(0);
  };

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, currentY, startY]);

  // 드래그 중일 때의 변환값 계산
  const getTransform = () => {
    if (!isDragging)
      return isOpen ? "translateY(0)" : "translateY(calc(100% - 80px))";

    const deltaY = currentY - startY;
    const baseTransform = isOpen ? 0 : window.innerHeight - 80;
    const newY = Math.max(
      0,
      Math.min(window.innerHeight - 80, baseTransform + deltaY)
    );

    return `translateY(${newY}px)`;
  };

  return (
    <>
      {/* 오버레이 (열려있을 때만) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 바텀시트 */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm rounded-t-3xl z-50 lg:hidden transition-transform duration-300 ease-out ${
          isDragging ? "" : ""
        }`}
        style={{
          transform: getTransform(),
          height: "calc(100vh - 60px)",
          maxHeight: "calc(100vh - 60px)",
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex items-center justify-center py-4 cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* 드래그 바 */}
          <div className="w-12 h-1 bg-white/40 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {isOpen && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </>
  );
}
