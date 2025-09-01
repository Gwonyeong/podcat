"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./main.css";
import AdvancedAudioPlayer from "@/components/AdvancedAudioPlayer";
import BottomSheet from "@/components/ui/BottomSheet"; // Import BottomSheet
import ReactMarkdown from "react-markdown";
import Image from "next/image";

// 캘린더의 날짜 타입 정의
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

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
  const [date, setDate] = useState<Value>(new Date());
  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null); // Selected audio state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      console.log("세션 정보:", session);
    }
  }, [status, router, session]);

  // 선택된 날짜에 해당하는 오디오 트랙 필터링
  const getTracksForDate = (selectedDate: Date) => {
    return audios.filter((audio) => {
      const audioDate = new Date(audio.publishDate);
      return (
        audioDate.getFullYear() === selectedDate.getFullYear() &&
        audioDate.getMonth() === selectedDate.getMonth() &&
        audioDate.getDate() === selectedDate.getDate()
      );
    });
  };

  // 오디오 목록 가져오기
  const fetchAudios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audio");
      if (res.ok) {
        const data = await res.json();
        setAudios(data);
      } else {
        console.error("오디오 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("오디오 목록을 불러오는 중 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 오디오 목록 가져오기
  useEffect(() => {
    if (status === "authenticated") {
      fetchAudios();
    }
  }, [status]);

  // Card click handler
  const handleCardClick = (audio: Audio) => {
    setSelectedAudio(audio);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAudio(null);
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

  const selectedTracks = date instanceof Date ? getTracksForDate(date) : [];

  return (
    <div className="main-container">
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1>{session.user?.name}님, 환영합니다!</h1>
        <p>듣고 싶은 날짜를 선택하세요.</p>
      </header>

      <Calendar
        onChange={setDate}
        value={date}
        className="calendar-container"
        locale="ko-KR" // 한글 로케일 설정
      />

      <div className="mt-8">
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p>오디오를 불러오는 중...</p>
          </div>
        ) : selectedTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedTracks.map((audio) => (
              <div
                key={audio.id}
                className="audio-card bg-white rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 shadow overflow-hidden"
                onClick={() => handleCardClick(audio)}
              >
                {audio.imageUrl ? (
                  <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                    <Image
                      src={audio.imageUrl}
                      alt={audio.title}
                      layout="fill"
                      objectFit="cover"
                    />
                    {audio.category.presenterImage && (
                      <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                        <Image
                          src={audio.category.presenterImage}
                          alt={`${audio.category.name} 진행자`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center rounded-t-lg">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                      <p className="text-sm text-indigo-400 mt-2">No Thumbnail</p>
                    </div>
                    {audio.category.presenterImage && (
                      <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                        <Image
                          src={audio.category.presenterImage}
                          alt={`${audio.category.name} 진행자`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 flex-1 mr-2">{audio.title}</h3>
                    <span
                      className={`category-badge flex-shrink-0 ${
                        audio.category.isFree ? "free" : "paid"
                      }`}
                    >
                      {audio.category.name}
                    </span>
                  </div>
                  {audio.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{audio.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(audio.publishDate).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{ textAlign: "center", marginTop: "20px", color: "#9ca3af" }}
          >
            <p>선택한 날짜에 오디오가 없습니다.</p>
            <p className="text-sm mt-2">다른 날짜를 선택해보세요.</p>
          </div>
        )}
      </div>

      {selectedAudio && (
        <BottomSheet
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onOpen={() => setIsModalOpen(true)}
          title=""
        >
          <div className="text-gray-800 -mx-6 -mb-6">
            {/* 앨범 커버 섹션 */}
            <div className="relative">
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
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
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
                <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">{selectedAudio.title}</h2>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAudio.category.isFree 
                      ? "bg-green-500/20 text-green-100 border border-green-400/30" 
                      : "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30"
                  }`}>
                    {selectedAudio.category.name}
                  </span>
                  <span className="text-sm text-gray-200">
                    {new Date(selectedAudio.publishDate).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 플레이어 컨트롤 섹션 */}
            <div className="bg-white px-6 py-4 border-b">
              {selectedAudio.description && (
                <p className="text-sm text-gray-600 mb-4">{selectedAudio.description}</p>
              )}
              <AdvancedAudioPlayer
                src={selectedAudio.filePath}
                title={selectedAudio.title}
                onPlay={() => console.log(`${selectedAudio.title} 재생 시작`)}
                onPause={() => console.log(`${selectedAudio.title} 일시정지`)}
                onEnded={() => console.log(`${selectedAudio.title} 재생 완료`)}
              />
            </div>
            
            {/* 대본 섹션 */}
            <div className="bg-gray-50 px-6 py-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                대본
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{selectedAudio.script || "대본이 준비되지 않았습니다."}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}