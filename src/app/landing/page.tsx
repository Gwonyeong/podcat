"use client";

import { useState, useRef, useEffect } from "react";
import LandingAudioPlayer from "@/components/sections/LandingAudioPlayer";
import LandingAudioModal from "@/components/ui/LandingAudioModal";

export default function LandingPage() {
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <LandingAudioPlayer
        currentTrack={currentTrack}
        onTrackSelect={handleTrackSelect}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        audioRef={audioRef}
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
    </div>
  );
}
