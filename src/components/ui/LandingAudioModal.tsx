"use client";

import { useEffect, useState } from "react";
import { sampleTracks } from "@/data/sampleTracks";

interface LandingAudioModalProps {
  trackIndex: number;
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export default function LandingAudioModal({
  trackIndex,
  isOpen,
  onClose,
  isPlaying,
  onPlayPause,
  audioRef,
}: LandingAudioModalProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const track = sampleTracks[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-fade-in">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">트랙 정보</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 트랙 이미지와 기본 정보 */}
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                src={track.image}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {track.title}
              </h3>
              <p className="text-xl text-gray-600 mb-3">{track.artist}</p>
              <p className="text-gray-700 mb-4">{track.description}</p>

              {/* 메타 정보 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">카테고리:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {track.category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">재생 시간:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {track.duration}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">언어:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {track.language}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">품질:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {track.quality}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="px-6 pb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            상세 설명
          </h4>
          <p className="text-gray-700 leading-relaxed mb-6">
            {track.longDescription}
          </p>

          {/* 태그 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">태그</h4>
            <div className="flex flex-wrap gap-2">
              {track.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 재생 컨트롤 */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              재생 컨트롤
            </h4>

            {/* 진행 바 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* 재생/일시정지 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={onPlayPause}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors flex items-center space-x-2"
              >
                {isPlaying ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>재생</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-blue-800 text-sm">
                이 콘텐츠는 AI가 생성한 샘플입니다.
                <br />
                실제 서비스에서는 더욱 풍부하고 다양한 콘텐츠를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
