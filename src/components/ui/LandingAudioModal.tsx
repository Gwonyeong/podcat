"use client";

import React, { RefObject } from "react";
import { sampleTracks } from "@/data/sampleTracks";

interface LandingAudioModalProps {
  trackIndex: number;
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  audioRef: RefObject<HTMLAudioElement | null>;
}

export default function LandingAudioModal({
  trackIndex,
  isOpen,
  onClose,
  isPlaying,
  onPlayPause,
  audioRef,
}: LandingAudioModalProps) {
  const track = sampleTracks[trackIndex];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-t-3xl rounded-b-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-fade-in">
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
          <div className="flex flex-col">
            {/* 이미지 - 전체 가로축 사용, 중앙 정렬 */}
            <div className="w-full flex justify-center mb-6">
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden group cursor-pointer"
                   onClick={() => {
                     onPlayPause();
                     onClose();
                   }}>
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* 재생 아이콘 오버레이 */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/50">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                    <svg
                      className="w-8 h-8 md:w-10 md:h-10 text-gray-800 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 콘텐츠 정보 */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {track.title}
              </h3>
              <p className="text-lg md:text-xl text-gray-600 mb-3">
                {track.artist}
              </p>
              <p className="text-gray-700 mb-6">{track.description}</p>

              {/* 메타 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                <div className="flex justify-center md:justify-start">
                  <span className="text-gray-500">카테고리:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {track.category}
                  </span>
                </div>
                <div className="flex justify-center md:justify-start">
                  <span className="text-gray-500">재생 시간:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {track.duration}
                  </span>
                </div>
                <div className="flex justify-center md:justify-start">
                  <span className="text-gray-500">언어:</span>
                  <span className="ml-2 text-gray-900 font-medium flex items-center">
                    <span className="text-lg mr-1">{track.languageFlag}</span>
                    {track.language}
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
