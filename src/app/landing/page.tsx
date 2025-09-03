"use client";

import { useState, useRef } from "react";
import LandingAudioPlayer from "@/components/sections/LandingAudioPlayer";
import LandingAudioModal from "@/components/ui/LandingAudioModal";
import { useModalStore } from "@/store/modalStore";
import ApplicationModal from "@/components/ui/ApplicationModal";
import { trackCTAClick } from "@/lib/gtag";

export default function LandingPage() {
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { openApplicationModal } = useModalStore();

  const handleTrackSelect = (trackIndex: number) => {
    setCurrentTrack(trackIndex);
    setIsModalOpen(true);
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // 모달을 닫을 때 오디오 재생은 계속 유지
  };

  const handleCTAClick = () => {
    trackCTAClick("지금 무료로 시작하기", "landing_page");
    openApplicationModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <LandingAudioPlayer
        currentTrack={currentTrack}
        onTrackSelect={handleTrackSelect}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        audioRef={audioRef}
        onCTAClick={handleCTAClick}
      />

      {isModalOpen && currentTrack !== null && (
        <LandingAudioModal
          trackIndex={currentTrack}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          audioRef={audioRef}
        />
      )}

      <ApplicationModal />
    </div>
  );
}
