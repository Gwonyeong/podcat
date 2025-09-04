"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./main.css";
import BottomSheet from "@/components/ui/BottomSheet"; // Import BottomSheet
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import BottomNav from "@/components/ui/BottomNav";
import MiniAudioPlayer from "@/components/ui/MiniAudioPlayer";
import PlaylistBottomSheet from "@/components/ui/PlaylistBottomSheet";
import { usePlaylistStore } from "@/store/playlistStore";

// 주 단위 날짜 타입 정의
type WeekRange = [Date, Date];

// 주 단위 날짜 계산 유틸리티 함수
const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day; // 일요일을 주 시작으로
  return new Date(result.setDate(diff));
};

const getEndOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + 6; // 토요일을 주 끝으로
  return new Date(result.setDate(diff));
};

const getWeekRange = (date: Date): [Date, Date] => {
  return [getStartOfWeek(date), getEndOfWeek(date)];
};

// 해당 연도의 주차 계산 함수
const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};

interface Audio {
  id: number;
  title: string;
  description: string | null;
  script: string | null;
  publishDate: string;
  filePath: string;
  imageUrl: string | null;
  category: {
    id: number;
    name: string;
    isFree: boolean;
    presenterImage: string | null;
  };
}

export default function MainPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState<WeekRange>(getWeekRange(new Date()));
  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null); // Selected audio state
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [interestedCategoryIds, setInterestedCategoryIds] = useState<number[]>(
    []
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set([new Date().toDateString()])
  ); // 토글 상태 관리 - 오늘 날짜 기본 열림
  const [showAllContent, setShowAllContent] = useState<boolean>(true); // 무료 콘텐츠 모두 보기 토글
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // 확인 모달 상태
  const [todayTracks, setTodayTracks] = useState<Audio[]>([]); // 오늘의 트랙들
  const { addToPlaylist, setCurrentAudio, replacePlaylist, setPlaying } = usePlaylistStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
    }
  }, [status, router, session]);

  // 선택된 주에 해당하는 오디오 트랙 필터링 및 관심 카테고리 필터링
  const getTracksForWeek = (week: WeekRange) => {
    const [startOfWeek, endOfWeek] = week;
    return audios.filter((audio) => {
      const audioDate = new Date(audio.publishDate);
      audioDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 정규화
      
      const start = new Date(startOfWeek);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endOfWeek);
      end.setHours(23, 59, 59, 999); // 종료일은 23:59:59로 설정
      
      const isInWeekRange = audioDate >= start && audioDate <= end;
      
      // 무료 콘텐츠 모두 보기가 꺼져있으면 관심 카테고리 필터링 적용
      if (!showAllContent && audio.category.isFree) {
        return isInWeekRange && interestedCategoryIds.includes(audio.category.id);
      }
      
      return isInWeekRange;
    });
  };

  // 한 주의 오늘까지의 요일만 생성하고 오디오 데이터를 매핑하는 함수
  const getFullWeekDays = (weekRange: WeekRange, tracks: Audio[]) => {
    const [startDate] = weekRange;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오디오 데이터를 날짜별로 그룹핑
    const grouped: { [date: string]: Audio[] } = {};
    tracks.forEach((track) => {
      const trackDate = new Date(track.publishDate);
      trackDate.setHours(0, 0, 0, 0); // 시간 정규화
      const dateKey = trackDate.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(track);
    });

    // 한 주의 날짜 생성 (일요일부터 오늘까지만)
    const weekDays: Array<{ date: Date; tracks: Audio[]; isEmpty: boolean }> = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
      
      // 미래 날짜는 제외 (오늘은 포함)
      if (currentDate.getTime() > today.getTime()) {
        break;
      }
      
      const dateKey = currentDate.toDateString();
      
      weekDays.push({
        date: new Date(currentDate),
        tracks: grouped[dateKey] || [],
        isEmpty: !grouped[dateKey] || grouped[dateKey].length === 0
      });
    }

    // 정렬: 오늘을 첫 번째로, 나머지는 역순으로
    const todayIndex = weekDays.findIndex(day => 
      day.date.toDateString() === today.toDateString()
    );
    
    if (todayIndex !== -1) {
      const todayEntry = weekDays[todayIndex];
      const otherEntries = weekDays
        .filter((_, index) => index !== todayIndex)
        .reverse(); // 역순으로 정렬
      
      return [todayEntry, ...otherEntries];
    }
    
    return weekDays.reverse(); // 오늘이 없으면 전체를 역순으로
  };

  // 토글 상태 변경
  const toggleDayExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };


  // 이전/다음 주로 이동하는 함수들
  const goToPreviousWeek = () => {
    const [currentStart] = selectedWeek;
    const prevWeekStart = new Date(currentStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    setSelectedWeek(getWeekRange(prevWeekStart));
  };

  const goToNextWeek = () => {
    const [currentStart] = selectedWeek;
    const nextWeekStart = new Date(currentStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    setSelectedWeek(getWeekRange(nextWeekStart));
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(getWeekRange(new Date()));
  };

  // 사용자 데이터 가져오기
  const fetchUserData = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/user/interested-categories?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.plan);
        setInterestedCategoryIds(
          data.interestedCategories.map((cat: { id: number }) => cat.id)
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // 오디오 목록 가져오기
  const fetchAudios = async () => {
    setLoading(true);
    try {
      // 타임스탬프를 추가하여 브라우저 캐싱 완전 방지
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/audio?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAudios(data);
      } else {
        console.error("오디오 목록을 불러오는데 실패했습니다.");
        setAudios([]); // 실패 시 빈 배열 설정
      }
    } catch (error) {
      console.error("오디오 목록을 불러오는 중 오류가 발생했습니다:", error);
      setAudios([]); // 에러 시 빈 배열 설정
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    let isSubscribed = true; // cleanup을 위한 플래그
    
    if (status === "authenticated" && session?.user?.id && isSubscribed) {
      fetchUserData();
      fetchAudios();
    }
    
    return () => {
      isSubscribed = false; // cleanup 시 플래그 해제
    };
  }, [status, session?.user?.id]);

  // 오디오 접근 권한 확인
  const canAccessAudio = (audio: Audio) => {
    // 무료 카테고리는 모든 사용자가 접근 가능
    if (audio.category.isFree) return true;

    // 프로 요금제 사용자는 모든 콘텐츠 접근 가능
    if (userPlan === "pro") return true;

    // 무료 요금제 사용자는 관심 카테고리에 있는 유료 콘텐츠만 접근 가능
    return interestedCategoryIds.includes(audio.category.id);
  };

  // Card click handler
  const handleCardClick = (audio: Audio) => {
    if (!canAccessAudio(audio)) {
      alert(
        "이 콘텐츠에 접근하려면 프로 요금제로 업그레이드하거나 마이페이지에서 관심 카테고리로 설정해주세요."
      );
      return;
    }

    setSelectedAudio(audio);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAudio(null);
  };

  const handleAddToPlaylist = () => {
    if (selectedAudio) {
      const { currentAudio, isPlaying } = usePlaylistStore.getState();
      addToPlaylist(selectedAudio);
      
      // 현재 재생 중인 오디오가 없을 때만 자동 재생
      if (!currentAudio || !isPlaying) {
        setCurrentAudio(selectedAudio);
        setPlaying(true);
      }
    }
  };

  // 오늘의 콘텐츠로 플레이리스트 변경 버튼 클릭
  const handleReplaceWithTodayContent = (tracks: Audio[]) => {
    setTodayTracks(tracks);
    setShowConfirmModal(true);
  };

  // 플레이리스트 변경 확인
  const confirmReplacePlaylist = () => {
    replacePlaylist(todayTracks);
    setShowConfirmModal(false);
    setTodayTracks([]);
  };

  // 플레이리스트 변경 취소
  const cancelReplacePlaylist = () => {
    setShowConfirmModal(false);
    setTodayTracks([]);
  };

  if (status === "loading" || !session) {
    return (
      <div className="main-container">
        <div className="loading-spinner">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const selectedTracks = getTracksForWeek(selectedWeek);
  const fullWeekDays = getFullWeekDays(selectedWeek, selectedTracks);


  return (
    <div className="main-container pb-20">
      <header className="flex justify-between items-center mb-2 px-4">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Podcat Logo"
            width={56}
            height={56}
            className="rounded-lg"
          />
        </div>
        <div className="flex items-center">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 주 단위 네비게이션 */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-4 shadow-sm">
        <button
          onClick={goToPreviousWeek}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center flex-1 mx-4">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {selectedWeek[0].toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ~ {selectedWeek[1].toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
            </div>
            <div className="text-sm text-gray-500">
              {selectedWeek[0].getFullYear()}년 {getWeekNumber(selectedWeek[0])}주차
            </div>
          </div>
        </div>
        
        <button
          onClick={goToNextWeek}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 오늘 주로 이동 버튼 - 현재 주가 아닐 때만 표시 */}
      {(selectedWeek[0].toDateString() !== getStartOfWeek(new Date()).toDateString() || 
        selectedWeek[1].toDateString() !== getEndOfWeek(new Date()).toDateString()) && (
        <div className="text-center mb-8">
          <button
            onClick={goToCurrentWeek}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
          >
            이번 주로 이동
          </button>
        </div>
      )}

      {/* 무료 콘텐츠 모두 보기 토글 */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium transition-colors ${
            showAllContent ? 'text-indigo-600' : 'text-gray-500'
          }`}>
            {showAllContent ? '무료 콘텐츠 모두 보기' : '관심있는 카테고리 콘텐츠만 보기'}
          </span>
          <button
            onClick={() => setShowAllContent(!showAllContent)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              showAllContent ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showAllContent ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p>오디오를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-4 mb-40">
            {fullWeekDays.map((dayData) => {
              const { date: displayDate, tracks: dailyTracks, isEmpty } = dayData;
              const dateKey = displayDate.toDateString();
              const isExpanded = expandedDays.has(dateKey);
              const isToday = displayDate.toDateString() === new Date().toDateString();
              
              return (
                <div key={dateKey} className={`rounded-lg shadow-sm border transition-all duration-200 ${
                  isEmpty 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-100'
                }`}>
                  {/* 토글 헤더 */}
                  <button
                    onClick={() => !isEmpty && toggleDayExpansion(dateKey)}
                    className={`w-full p-4 flex items-center justify-between transition-colors rounded-lg ${
                      isEmpty 
                        ? 'cursor-default' 
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                    disabled={isEmpty}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-left ${isEmpty ? 'opacity-50' : ''}`}>
                        <h3 className={`text-lg font-bold ${
                          isEmpty 
                            ? 'text-gray-400' 
                            : isToday 
                              ? 'text-indigo-600' 
                              : 'text-gray-800'
                        }`}>
                          {isToday ? '오늘' : displayDate.toLocaleDateString("ko-KR", {
                            weekday: "long",
                          })}
                          {!isToday && (
                            <span className="ml-2 text-sm font-medium">
                              {displayDate.toLocaleDateString("ko-KR", {
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </h3>
                        {isToday && !isEmpty && (
                          <p className="text-sm text-indigo-500">
                            {displayDate.toLocaleDateString("ko-KR", {
                              month: "long",
                              day: "numeric",
                              weekday: "long",
                            })}
                          </p>
                        )}
                      </div>
                      <div className={`flex-1 h-px ${
                        isEmpty ? 'bg-gray-200' : 'bg-gray-200'
                      }`}></div>
                      
                      {isEmpty ? (
                        <span className="text-sm px-3 py-1 rounded-full text-gray-400 bg-gray-200 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          준비중
                        </span>
                      ) : (
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          isToday 
                            ? 'text-indigo-700 bg-indigo-100' 
                            : 'text-gray-500 bg-gray-100'
                        }`}>
                          {dailyTracks.length}개 에피소드
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center ml-4">
                      {!isEmpty && (
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          } text-gray-500`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* 토글 컨텐츠 */}
                  {isExpanded && !isEmpty && (
                    <div className="px-4 pb-4">
                      {/* 오늘의 콘텐츠로 플레이리스트 변경 버튼 (오늘일 경우에만 표시) */}
                      {isToday && dailyTracks.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => handleReplaceWithTodayContent(dailyTracks)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>오늘의 콘텐츠로 플레이리스트 변경</span>
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-4">
                        {dailyTracks.map((audio) => {
                          const hasAccess = canAccessAudio(audio);
                          return (
                            <div
                              key={audio.id}
                              className={`audio-card relative bg-white rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 shadow-sm overflow-hidden flex ${
                                !hasAccess
                                  ? "opacity-60 border-2 border-gray-300 border-dashed"
                                  : ""
                              }`}
                              onClick={() => handleCardClick(audio)}
                            >
                              {!hasAccess && (
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10 rounded-lg">
                                  <div className="text-center text-white">
                                    <svg
                                      className="w-6 h-6 mx-auto mb-1"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                    <p className="text-xs font-medium">제한된 콘텐츠</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* 썸네일 영역 - 1:1 비율 유지, 크기 확대 */}
                              <div className="flex-shrink-0 w-28 h-28 relative">
                                {audio.imageUrl ? (
                                  <div className="relative w-full h-full rounded-l-lg overflow-hidden">
                                    <Image
                                      src={audio.imageUrl}
                                      alt={audio.title}
                                      layout="fill"
                                      objectFit="cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center rounded-l-lg">
                                    <svg
                                      className="w-12 h-12 text-indigo-300"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                                    </svg>
                                  </div>
                                )}
                                
                                {/* 진행자 이미지 - 썸네일 우측 아래 */}
                                {audio.category.presenterImage && (
                                  <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white">
                                    <Image
                                      src={audio.category.presenterImage}
                                      alt={`${audio.category.name} 진행자`}
                                      layout="fill"
                                      objectFit="cover"
                                    />
                                  </div>
                                )}
                              </div>
                              
                              {/* 콘텐츠 영역 */}
                              <div className="flex-1 p-4 min-w-0">
                                {/* 데스크톱: 제목과 카테고리 같은 줄 / 모바일: 제목 전체 너비 사용 */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                  <h3 className="font-semibold text-base text-gray-800 flex-1 line-clamp-2">
                                    {audio.title}
                                  </h3>
                                  <span
                                    className={`category-badge inline-block sm:flex-shrink-0 text-xs self-start ${
                                      audio.category.isFree ? "free" : "paid"
                                    }`}
                                  >
                                    {audio.category.name}
                                  </span>
                                </div>
                                {audio.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                    {audio.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedAudio && (
        <BottomSheet
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title=""
          variant="audio-detail"
        >
          <div className="text-gray-800 -mx-6 -mb-6 ">
            {/* 앨범 커버 섹션 */}
            <div className="relative group cursor-pointer"
                 onClick={() => {
                   if (selectedAudio) {
                     addToPlaylist(selectedAudio);
                     setCurrentAudio(selectedAudio);
                     setPlaying(true);
                   }
                   handleModalClose();
                 }}>
              {selectedAudio.imageUrl ? (
                <div className="relative w-full h-64 bg-gradient-to-b from-gray-900 to-gray-700">
                  <Image
                    src={selectedAudio.imageUrl}
                    alt={selectedAudio.title}
                    layout="fill"
                    objectFit="cover"
                    className="opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  {/* 재생 아이콘 오버레이 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="w-10 h-10 text-gray-800 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="w-10 h-10 text-gray-800 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* 진행자 이미지 */}
              {selectedAudio.category.presenterImage && (
                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-xl">
                  <Image
                    src={selectedAudio.category.presenterImage}
                    alt={`${selectedAudio.category.name} 진행자`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}

              {/* 제목과 정보 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">
                  {selectedAudio.title}
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      selectedAudio.category.isFree
                        ? "bg-green-500/20 text-green-100 border border-green-400/30"
                        : "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30"
                    }`}
                  >
                    {selectedAudio.category.name}
                  </span>
                  <span className="text-sm text-gray-200">
                    {new Date(selectedAudio.publishDate).toLocaleDateString(
                      "ko-KR"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 플레이어 컨트롤 섹션 */}

            {/* 콘텐츠 섹션 */}
            <div className="bg-gray-50 px-6 py-6 space-y-6">
              {/* 설명 섹션 */}
              {selectedAudio.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    오디오 설명
                  </h3>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedAudio.description}
                    </p>
                  </div>
                </div>
              )}

              {/* 대본 섹션 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    대본
                  </h3>

                  {/* 플레이리스트 추가 버튼 */}
                  <button
                    onClick={handleAddToPlaylist}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>플레이리스트에 추가</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>
                      {selectedAudio.script || "대본이 준비되지 않았습니다."}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* 미니 오디오 플레이어 */}
      <MiniAudioPlayer />

      {/* 플레이리스트 바텀시트 */}
      <PlaylistBottomSheet />

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                플레이리스트 변경 확인
              </h3>
              <p className="text-gray-600 mb-6">
                현재 플레이리스트를 오늘의 콘텐츠({todayTracks.length}개)로 변경하시겠습니까?
                <br />
                <span className="text-sm text-gray-500">기존 플레이리스트는 삭제됩니다.</span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelReplacePlaylist}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmReplacePlaylist}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 바 */}
      <BottomNav />
    </div>
  );
}
