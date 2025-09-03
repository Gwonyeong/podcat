"use client";

import { useEffect, useState } from "react";
import { sampleTracks } from "@/data/sampleTracks";
import BottomSheet from "@/components/ui/BottomSheet";
import {
  generateSessionId,
  trackSamplePlay,
  trackSamplePlayComplete,
  trackUserActivity,
} from "@/lib/activityTracker";

interface LandingAudioPlayerProps {
  currentTrack: number | null;
  onTrackSelect: (trackIndex: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onCTAClick: () => void;
}

export default function LandingAudioPlayer({
  currentTrack,
  onTrackSelect,
  isPlaying,
  onPlayPause,
  audioRef,
  onCTAClick,
}: LandingAudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [sessionId] = useState(() => generateSessionId());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = async () => {
      // 부모 컴포넌트에 재생 종료를 알림
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // 샘플 재생 완료 활동 추적
      if (currentTrack !== null) {
        const track = sampleTracks[currentTrack];
        await trackSamplePlayComplete(
          sessionId,
          track.id,
          track.title,
          track.category,
          Math.floor(audioRef.current?.duration || 0)
        );
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, currentTrack, sessionId]);

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleNext = () => {
    if (currentTrack !== null) {
      const nextTrack = (currentTrack + 1) % sampleTracks.length;
      onTrackSelect(nextTrack);
    }
  };

  const handlePrevious = () => {
    if (currentTrack !== null) {
      const prevTrack =
        currentTrack === 0 ? sampleTracks.length - 1 : currentTrack - 1;
      onTrackSelect(prevTrack);
    }
  };

  // 바텀시트 콘텐츠 (모바일용)
  const bottomSheetContent = (
    <>
      {/* 현재 재생 중인 트랙 정보 */}
      {currentTrack !== null && (
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
          <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden">
            <img
              src={sampleTracks[currentTrack].image}
              alt={sampleTracks[currentTrack].title}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 text-center">
            {sampleTracks[currentTrack].title}
          </h3>
          <p className="text-gray-300 text-center mb-4">
            {sampleTracks[currentTrack].artist}
          </p>
          <p className="text-gray-400 text-sm text-center">
            {sampleTracks[currentTrack].description}
          </p>
        </div>
      )}

      {/* 재생 컨트롤 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* 메인 컨트롤 버튼들 */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-3 rounded-full transition-colors ${
              isShuffled ? "text-blue-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2V4zM5 8v6h10V8H5z" />
            </svg>
          </button>

          <button
            onClick={handlePrevious}
            className="p-3 text-white hover:text-blue-400 transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={onPlayPause}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1H7z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-3 text-white hover:text-blue-400 transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4a1 1 0 00-1.555.832L10 6.798V4a1 1 0 00-1.555-.832l-6 4z" />
            </svg>
          </button>

          <button
            onClick={() => setIsRepeated(!isRepeated)}
            className={`p-3 rounded-full transition-colors ${
              isRepeated ? "text-blue-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* 볼륨 컨트롤 */}
        <div className="flex items-center space-x-3">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.776a1 1 0 011.383.152zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* 왼쪽 사이드바 - 트랙 목록 */}
      <div className="w-full lg:w-1/3 bg-black/30 backdrop-blur-sm p-4 sm:p-6">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <img
              src="/logo.png"
              alt="Podcat"
              className="w-12 h-12 mr-3 filter brightness-0 invert"
            />
            <h1 className="text-2xl font-bold text-white">Podcat</h1>
          </div>
          <p className="text-gray-300 text-sm">
            AI가 큐레이션하는 개인 맞춤형 오디오 뉴스레터
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            샘플 뉴스레터
          </h2>
          <p className="text-gray-300 text-sm mb-4">
            카카오톡 무료 등록 후 더 많은 콘텐츠를 들어보세요
          </p>

          {/* CTA 버튼 */}
          <button
            onClick={async () => {
              onCTAClick();

              // CTA 버튼 클릭 활동 추적
              await trackUserActivity({
                sessionId,
                action: "cta_button_click",
                userAgent: navigator.userAgent,
              });
            }}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 mb-4"
          >
            🎧 지금 카카오톡으로 뉴스레터 받아보기
          </button>
        </div>

        <div className="mb-6">
          {/* 트랙 목록을 위한 새로운 섹션 */}
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {sampleTracks.map((track, index) => (
              <div
                key={track.id}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  currentTrack === index
                    ? "bg-blue-600/30 border border-blue-500/50"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                onClick={async () => {
                  onTrackSelect(index);
                  setIsBottomSheetOpen(true);

                  // 샘플 재생 활동 추적
                  const track = sampleTracks[index];
                  await trackSamplePlay(
                    sessionId,
                    track.id,
                    track.title,
                    track.category
                  );
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      {track.artist}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                        {track.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {track.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 - 데스크톱만 표시 */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-4 sm:p-8">
        {/* 현재 재생 중인 트랙 정보 */}
        {currentTrack !== null && (
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 mb-8 max-w-md mx-4 sm:mx-0 mt-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden">
              <img
                src={sampleTracks[currentTrack].image}
                alt={sampleTracks[currentTrack].title}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              {sampleTracks[currentTrack].title}
            </h3>
            <p className="text-gray-300 text-center mb-4">
              {sampleTracks[currentTrack].artist}
            </p>
            <p className="text-gray-400 text-sm text-center">
              {sampleTracks[currentTrack].description}
            </p>
          </div>
        )}

        {/* 재생 컨트롤 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-4 sm:mx-0">
          {/* 진행 바 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* 메인 컨트롤 버튼들 */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`p-3 rounded-full transition-colors ${
                isShuffled ? "text-blue-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2V4zM5 8v6h10V8H5z" />
              </svg>
            </button>

            <button
              onClick={handlePrevious}
              className="p-3 text-white hover:text-blue-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>

            <button
              onClick={onPlayPause}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              {isPlaying ? (
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1H7z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-3 text-white hover:text-blue-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4a1 1 0 00-1.555.832L10 6.798V4a1 1 0 00-1.555-.832l-6 4z" />
              </svg>
            </button>

            <button
              onClick={() => setIsRepeated(!isRepeated)}
              className={`p-3 rounded-full transition-colors ${
                isRepeated ? "text-blue-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* 볼륨 컨트롤 */}
          <div className="flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.776a1 1 0 011.383.152zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* 숨겨진 오디오 엘리먼트 */}
        <audio
          ref={audioRef}
          src={
            currentTrack !== null
              ? sampleTracks[currentTrack].audioSrc
              : undefined
          }
          preload="metadata"
        />
      </div>

      {/* 모바일용 바텀시트 */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="재생 컨트롤"
      >
        {bottomSheetContent}
      </BottomSheet>

      {/* 모바일용 숨겨진 오디오 엘리먼트 */}
      <div className="lg:hidden">
        <audio
          ref={audioRef}
          src={
            currentTrack !== null
              ? sampleTracks[currentTrack].audioSrc
              : undefined
          }
          preload="metadata"
        />
      </div>
    </div>
  );
}
