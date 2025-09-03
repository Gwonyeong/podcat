"use client";

import { usePlaylistStore } from "@/store/playlistStore";
import BottomSheet from "./BottomSheet";
import Image from "next/image";
import { useState } from "react";

export default function PlaylistBottomSheet() {
  const {
    isPlaylistOpen,
    closePlaylist,
    playlist,
    currentIndex,
    setCurrentIndex,
    removeFromPlaylist,
    clearPlaylist,
    currentAudio,
    setPlaying,
    isPlaying,
    reorderPlaylist,
  } = usePlaylistStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTrackClick = (index: number) => {
    const wasPlaying = isPlaying;
    setCurrentIndex(index);
    
    // 이전에 재생 중이었거나 같은 트랙을 다시 클릭한 경우 자동 재생
    if (wasPlaying || index !== currentIndex) {
      setTimeout(() => {
        setPlaying(true);
      }, 100); // 오디오 로드 시간을 위한 약간의 지연
    }
  };

  const handleRemoveTrack = (audioId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    removeFromPlaylist(audioId);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderPlaylist(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setDraggedIndex(index);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || touchStartY === null) return;
    
    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - touchStartY);
    
    // 일정 거리 이상 움직이면 드래그 시작
    if (deltaY > 10) {
      setIsDragging(true);
      e.preventDefault(); // 스크롤 방지
      
      // 현재 터치 위치에서 가장 가까운 항목 찾기
      const elements = document.querySelectorAll('[data-playlist-item]');
      let closestIndex = draggedIndex;
      let minDistance = Infinity;
      
      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distance = Math.abs(touch.clientY - centerY);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      setDragOverIndex(closestIndex);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging && draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      reorderPlaylist(draggedIndex, dragOverIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchStartY(null);
    setIsDragging(false);
  };

  return (
    <BottomSheet
      isOpen={isPlaylistOpen}
      onClose={closePlaylist}
      title=""
      variant="playlist"
    >
      <div className="-m-6 h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">재생목록</h2>
              <p className="text-sm text-gray-500">
                {playlist.length}개의 트랙
              </p>
            </div>
            {playlist.length > 0 && (
              <button
                onClick={clearPlaylist}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                전체 삭제
              </button>
            )}
          </div>
        </div>

        {/* 플레이리스트 */}
        <div className="bg-gray-50 flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-1v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-600 mb-2">재생목록이 비어있습니다</h3>
              <p className="text-sm text-gray-500">오디오를 재생목록에 추가해보세요</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {playlist.map((audio, index) => (
                <div
                  key={audio.id}
                  data-playlist-item
                  className={`flex items-center transition-colors ${
                    index === currentIndex ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                  } ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${
                    dragOverIndex === index ? 'border-t-2 border-indigo-400' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* 드래그 핸들 - 햄버거 아이콘 */}
                  <div 
                    className={`px-3 py-4 cursor-grab active:cursor-grabbing touch-manipulation transition-colors ${
                      isDragging && draggedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <svg className={`w-5 h-5 transition-colors ${
                      isDragging && draggedIndex === index ? 'text-blue-500' : 'text-gray-400'
                    }`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                  </div>

                  {/* 클릭 가능한 트랙 영역 */}
                  <div 
                    className="flex-1 flex items-center py-4 pr-4 hover:bg-white hover:bg-opacity-50 cursor-pointer"
                    onClick={() => {
                      // 드래그 중이 아닐 때만 클릭 허용
                      if (!isDragging) {
                        handleTrackClick(index);
                      }
                    }}
                  >
                      {/* 썸네일 */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 mr-3">
                        {audio.imageUrl ? (
                          <Image
                            src={audio.imageUrl}
                            alt={audio.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                          </div>
                        )}
                        
                        {/* 현재 재생 중 표시 */}
                        {index === currentIndex && (
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      {/* 트랙 정보 */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium truncate ${
                          index === currentIndex ? 'text-indigo-600' : 'text-gray-900'
                        }`}>
                          {audio.title}
                        </h4>
                        <div className="flex items-center mt-1">
                          {/* 카테고리 텍스트 */}
                          <span className="text-xs text-gray-500 font-medium">
                            {audio.category.name}
                          </span>
                        </div>
                      </div>

                      {/* 진행자 이미지 */}
                      <div className="flex items-center mr-3">
                        {audio.category.presenterImage && (
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={audio.category.presenterImage}
                              alt={`${audio.category.name} 진행자`}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => handleRemoveTrack(audio.id, e)}
                    className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    title="재생목록에서 제거"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        {playlist.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              현재 재생 중: {currentAudio?.title || '없음'}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}