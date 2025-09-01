"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./main.css";
import AdvancedAudioPlayer from "@/components/AdvancedAudioPlayer";
import BottomSheet from "@/components/ui/BottomSheet"; // Import BottomSheet

// 캘린더의 날짜 타입 정의
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Audio {
  id: number;
  title: string;
  publishDate: string;
  filePath: string;
  category: {
    id: number;
    name: string;
    isFree: boolean;
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
                className="audio-card bg-white p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-300 shadow"
                onClick={() => handleCardClick(audio)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">{audio.title}</h3>
                  <span
                    className={`category-badge ${
                      audio.category.isFree ? "free" : "paid"
                    }`}
                  >
                    {audio.category.name}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(audio.publishDate).toLocaleDateString("ko-KR")}
                </p>
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
          title={selectedAudio.title}
        >
          <div className="p-4 text-gray-800">
            <div className="flex justify-between items-center mb-4">
              <span
                className={`category-badge ${
                  selectedAudio.category.isFree ? "free" : "paid"
                }`}
              >
                {selectedAudio.category.name}
              </span>
              <p className="text-sm text-gray-500">
                {new Date(selectedAudio.publishDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <p className="mb-4 text-gray-600">
              {/* 여기에 오디오에 대한 설명을 추가할 수 있습니다. */}
              오디오에 대한 상세 설명이 여기에 표시됩니다.
            </p>
            <AdvancedAudioPlayer
              src={selectedAudio.filePath}
              title={selectedAudio.title}
              onPlay={() => console.log(`${selectedAudio.title} 재생 시작`)}
              onPause={() => console.log(`${selectedAudio.title} 일시정지`)}
              onEnded={() => console.log(`${selectedAudio.title} 재생 완료`)}
            />
          </div>
        </BottomSheet>
      )}
    </div>
  );
}