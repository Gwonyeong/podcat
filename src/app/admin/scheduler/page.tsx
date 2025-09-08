"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  isFree: boolean;
}

interface GeneratedAudio {
  id: number;
  createdAt: string;
  audio: {
    id: number;
    title: string;
    publishDate: string;
  };
}

interface AudioScheduler {
  id: number;
  name: string;
  categoryId: number;
  prompt: string;
  elevenLabsVoiceId: string;
  cronExpression: string;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  totalGenerated: number;
  createdAt: string;
  category: Category;
  generatedAudios: GeneratedAudio[];
}

export default function SchedulerPage() {
  const [schedulers, setSchedulers] = useState<AudioScheduler[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingSchedulers, setExecutingSchedulers] = useState<Set<number>>(new Set());

  const fetchSchedulers = async () => {
    try {
      const res = await fetch("/api/admin/scheduler");
      const data = await res.json();
      setSchedulers(data);
    } catch (error) {
      console.error("스케줄러 목록을 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulers();
  }, []);

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/scheduler/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        fetchSchedulers();
      } else {
        alert("상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("상태 변경 중 오류가 발생했습니다:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleExecute = async (id: number) => {
    if (!confirm("이 스케줄러를 지금 실행하시겠습니까?")) {
      return;
    }

    // 실행 중 상태로 설정
    setExecutingSchedulers(prev => new Set(prev).add(id));

    try {
      const res = await fetch("/api/admin/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedulerId: id,
          generateFromPrompt: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`스케줄러가 성공적으로 실행되었습니다.\n오디오 제목: ${data.audio?.title || '제목 없음'}`);
        fetchSchedulers();
      } else {
        const data = await res.json();
        alert(`실행에 실패했습니다: ${data.error}`);
      }
    } catch (error) {
      console.error("실행 중 오류가 발생했습니다:", error);
      alert("실행 중 오류가 발생했습니다.");
    } finally {
      // 실행 완료 후 상태 제거
      setExecutingSchedulers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 스케줄러를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/scheduler/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSchedulers();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("삭제 중 오류가 발생했습니다:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          오디오 자동 생성기
        </h2>
        <Link
          href="/admin/scheduler/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          새 스케줄러 생성
        </Link>
      </div>

      {schedulers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            스케줄러가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">새로운 스케줄러를 추가해보세요.</p>
          <Link
            href="/admin/scheduler/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            첫 번째 스케줄러 추가
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schedulers.map((scheduler) => (
            <div
              key={scheduler.id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                executingSchedulers.has(scheduler.id)
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {scheduler.name}
                    </h3>
                    {executingSchedulers.has(scheduler.id) && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600 mr-1"></div>
                        실행 중
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      scheduler.category?.isFree
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {scheduler.category?.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      scheduler.isActive ? "bg-green-400" : "bg-gray-400"
                    }`}
                  ></span>
                  <span className="ml-2 text-sm text-gray-500">
                    {scheduler.isActive ? "활성" : "비활성"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <span className="font-medium">실행 주기:</span>{" "}
                  {scheduler.cronExpression}
                </div>
                <div>
                  <span className="font-medium">총 생성:</span>{" "}
                  {scheduler.totalGenerated}개
                </div>
                {scheduler.nextRunAt && (
                  <div>
                    <span className="font-medium">다음 실행:</span>{" "}
                    {new Date(scheduler.nextRunAt).toLocaleString("ko-KR")}
                  </div>
                )}
                {scheduler.lastRunAt && (
                  <div>
                    <span className="font-medium">마지막 실행:</span>{" "}
                    {new Date(scheduler.lastRunAt).toLocaleString("ko-KR")}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                <button
                  onClick={() => handleToggle(scheduler.id, scheduler.isActive)}
                  disabled={executingSchedulers.has(scheduler.id)}
                  className={`flex-1 text-xs px-3 py-1 rounded-md font-medium ${
                    executingSchedulers.has(scheduler.id)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : scheduler.isActive
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {scheduler.isActive ? "비활성화" : "활성화"}
                </button>
                <button
                  onClick={() => handleExecute(scheduler.id)}
                  disabled={executingSchedulers.has(scheduler.id)}
                  className={`flex-1 text-xs px-3 py-1 rounded-md font-medium ${
                    executingSchedulers.has(scheduler.id)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {executingSchedulers.has(scheduler.id) ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                      실행 중...
                    </div>
                  ) : (
                    "지금 실행"
                  )}
                </button>
                <Link
                  href={`/admin/scheduler/edit/${scheduler.id}`}
                  className={`flex-1 text-xs px-3 py-1 rounded-md font-medium text-center ${
                    executingSchedulers.has(scheduler.id)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  수정
                </Link>
                <button
                  onClick={() => handleDelete(scheduler.id)}
                  disabled={executingSchedulers.has(scheduler.id)}
                  className={`flex-1 text-xs px-3 py-1 rounded-md font-medium ${
                    executingSchedulers.has(scheduler.id)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}