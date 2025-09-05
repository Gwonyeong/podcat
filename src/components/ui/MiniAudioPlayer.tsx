"use client";

import Image from "next/image";
import { usePlaylistStore } from "@/store/playlistStore";
import { useRef, useEffect, useState } from "react";

export default function MiniAudioPlayer() {
  const {
    currentAudio,
    isPlaying,
    setPlaying,
    nextTrack,
    previousTrack,
    openPlaylist,
    playlist,
    playbackRate,
    cyclePlaybackRate,
  } = usePlaylistStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 오디오 이벤트 핸들러 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      // 플레이리스트에 다음 트랙이 있는지 확인
      const { currentIndex, playlist } = usePlaylistStore.getState();
      const hasNextTrack = currentIndex < playlist.length - 1;
      
      if (hasNextTrack) {
        // 다음 트랙이 있으면 자동 재생
        nextTrack();
        setTimeout(() => {
          setPlaying(true);
        }, 100);
      } else {
        // 마지막 트랙이면 재생 종료
        setPlaying(false);
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
  }, [currentAudio, setPlaying, nextTrack]);

  // 새 오디오가 선택되었을 때 자동 재생
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) return;

    // 새 오디오 소스가 로드되면 자동으로 재생
    const handleLoadedData = () => {
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener("loadeddata", handleLoadedData);

    // 현재 재생 중이면 새 트랙을 자동 재생
    if (isPlaying) {
      setPlaying(true); // 재생 상태를 유지하고 새 트랙 재생
    }

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [currentAudio]);

  // 재생/일시정지 상태 동기화
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 배속 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate, currentAudio]);

  if (!currentAudio || playlist.length === 0) return null;

  const handlePlaylistClick = () => {
    openPlaylist();
  };

  const handlePlayPause = () => {
    setPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const wasPlaying = isPlaying;
    previousTrack();
    // 이전에 재생 중이었으면 새 트랙도 자동 재생
    if (wasPlaying) {
      setTimeout(() => {
        setPlaying(true);
      }, 100);
    }
  };

  const handleNext = () => {
    const wasPlaying = isPlaying;
    nextTrack();
    // 이전에 재생 중이었으면 새 트랙도 자동 재생
    if (wasPlaying) {
      setTimeout(() => {
        setPlaying(true);
      }, 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = parseFloat(e.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    // 슬라이더 터치 시 스크롤 방지
    e.stopPropagation();
  };

  const handleSliderTouchMove = (e: React.TouchEvent) => {
    // 슬라이더 이동 시 스크롤 방지
    e.stopPropagation();
  };

  return (
    <div
      className="fixed bottom-16 left-0 right-0 bg-white "
      style={{ zIndex: 45 }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={currentAudio.filePath} preload="metadata" />

      <div className="max-w-md mx-auto">
        <div className="flex items-center px-4 py-3 space-x-3">
          {/* 썸네일 - 클릭 가능 */}
          <button
            onClick={handlePlaylistClick}
            className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 hover:shadow-md transition-shadow"
          >
            {currentAudio.imageUrl ? (
              <Image
                src={currentAudio.imageUrl}
                alt={currentAudio.title}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
            )}
          </button>

          {/* 제목과 진행자 - 클릭 가능 */}
          <button
            onClick={handlePlaylistClick}
            className="flex-1 min-w-0 text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentAudio.title}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentAudio.category.name}
            </p>
          </button>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={playlist.length === 0}
              title="이전 트랙"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={handlePlayPause}
              className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              title={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={playlist.length === 0}
              title="다음 트랙"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            <button
              onClick={cyclePlaybackRate}
              className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="배속 변경"
            >
              <span className="text-xs font-bold text-gray-700 min-w-[24px] text-center">
                {playbackRate}x
              </span>
            </button>

            <button
              onClick={handlePlaylistClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="플레이리스트 보기"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="px-4 pb-2">
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              onTouchStart={handleSliderTouchStart}
              onTouchMove={handleSliderTouchMove}
              className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb touch-none"
              style={{
                background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${
                  duration > 0 ? (currentTime / duration) * 100 : 0
                }%, #e5e7eb ${
                  duration > 0 ? (currentTime / duration) * 100 : 0
                }%, #e5e7eb 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
