'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './main.css';
import { sampleTracks } from '@/data/sampleTracks'; // 샘플 데이터 임포트

// 캘린더의 날짜 타입 정의
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function MainPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [date, setDate] = useState<Value>(new Date());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      console.log('세션 정보:', session);
    }
  }, [status, router, session]);

  if (status === 'loading' || !session) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  // 선택된 날짜에 해당하는 오디오 트랙 필터링 (날짜만 비교)
  const getTracksForDate = (selectedDate: Date) => {
    return sampleTracks.filter(track => {
      const trackDate = new Date(track.publishDate);
      return (
        trackDate.getFullYear() === selectedDate.getFullYear() &&
        trackDate.getMonth() === selectedDate.getMonth() &&
        trackDate.getDate() === selectedDate.getDate()
      );
    });
  };

  const selectedTracks = date instanceof Date ? getTracksForDate(date) : [];

  return (
    <div className="main-container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>{session.user?.name}님, 환영합니다!</h1>
        <p>듣고 싶은 날짜를 선택하세요.</p>
      </header>
      
      <Calendar
        onChange={setDate}
        value={date}
        className="calendar-container"
        locale="ko-KR" // 한글 로케일 설정
      />

      <div className="audio-list">
        {selectedTracks.length > 0 ? (
          selectedTracks.map(track => (
            <div key={track.id} className="audio-item">
              <h3>{track.title}</h3>
              <p>{track.category}</p>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280' }}>
            <p>선택한 날짜에 오디오가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
