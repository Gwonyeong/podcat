"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  isFree: boolean;
  presenterName?: string | null;
  presenterPersona?: string | null;
  presenterVoiceId?: string | null;
}

interface Topic {
  title: string;
  description?: string;
}

type PromptMode = 'single' | 'perplexity' | 'list';

interface AudioScheduler {
  id: number;
  name: string;
  categoryId: number;
  prompt: string;
  promptMode: PromptMode;
  topicList: Topic[] | null;
  currentTopicIndex: number;
  usePerplexity: boolean;
  perplexitySystemPrompt: string | null;
  publishDateOffset: number;
  cronExpression: string;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  totalGenerated: number;
  autoGenerateTopics: boolean;
  autoGenerateCount: number;
  topicThreshold: number;
  createdAt: string;
  category: Category;
}

export default function EditSchedulerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [scheduler, setScheduler] = useState<AudioScheduler | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");
  const [prompt, setPrompt] = useState("");
  const [promptMode, setPromptMode] = useState<PromptMode>('single');
  const [topicList, setTopicList] = useState<Topic[]>([{ title: '', description: '' }]);
  const [perplexitySystemPrompt, setPerplexitySystemPrompt] = useState("");
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["*"]);
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(["09:00"]);
  const [publishDateOffset, setPublishDateOffset] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    audioUrl: string;
    thumbnailUrl?: string;
    duration: number;
  } | null>(null);
  const [autoGenerateTopics, setAutoGenerateTopics] = useState(false);
  const [autoGenerateCount, setAutoGenerateCount] = useState(5);
  const [topicThreshold, setTopicThreshold] = useState(2);

  const daysOfWeek = [
    { label: "매일", value: "*" },
    { label: "월", value: "1" },
    { label: "화", value: "2" },
    { label: "수", value: "3" },
    { label: "목", value: "4" },
    { label: "금", value: "5" },
    { label: "토", value: "6" },
    { label: "일", value: "0" },
  ];

  // 크론 표현식을 요일과 시간으로 파싱하는 함수
  const parseCronExpression = (cronExpr: string) => {
    const parts = cronExpr.split(" ");
    if (parts.length >= 5) {
      const minute = parts[0];
      const hour = parts[1];
      const days = parts[4];
      
      const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
      const dayArray = days === "*" ? ["*"] : days.split(",");
      
      return { days: dayArray, times: [time] };
    }
    return { days: ["*"], times: ["09:00"] };
  };

  // 요일과 시간을 크론 표현식으로 변환하는 함수
  const generateCronExpression = () => {
    if (scheduleTimes.length === 0) return "0 9 * * *";
    
    const days = selectedDays.includes("*") || selectedDays.length === 7 
      ? "*" 
      : selectedDays.join(",");
    
    const [hour, minute] = scheduleTimes[0].split(":");
    return `${minute} ${hour} * * ${days}`;
  };

  const handleDayToggle = (dayValue: string) => {
    if (dayValue === "*") {
      setSelectedDays(["*"]);
    } else {
      const newSelectedDays = selectedDays.filter(d => d !== "*");
      if (newSelectedDays.includes(dayValue)) {
        const filtered = newSelectedDays.filter(d => d !== dayValue);
        setSelectedDays(filtered.length === 0 ? ["*"] : filtered);
      } else {
        setSelectedDays([...newSelectedDays, dayValue]);
      }
    }
  };

  const addScheduleTime = () => {
    const newTime = "09:00";
    setScheduleTimes([...scheduleTimes, newTime]);
  };

  const removeScheduleTime = (index: number) => {
    if (scheduleTimes.length > 1) {
      setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
    }
  };

  const updateScheduleTime = (index: number, newTime: string) => {
    const updatedTimes = [...scheduleTimes];
    updatedTimes[index] = newTime;
    setScheduleTimes(updatedTimes);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulerRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/scheduler/${id}`),
          fetch("/api/admin/categories"),
        ]);

        const schedulerData = await schedulerRes.json();
        const categoriesData = await categoriesRes.json();

        if (schedulerRes.ok) {
          setScheduler(schedulerData);
          setName(schedulerData.name);
          setCategoryId(schedulerData.categoryId);
          setPromptMode(schedulerData.promptMode || 'single');
          setPublishDateOffset(schedulerData.publishDateOffset || 0);
          setIsActive(schedulerData.isActive);
          setAutoGenerateTopics(schedulerData.autoGenerateTopics || false);
          setAutoGenerateCount(schedulerData.autoGenerateCount || 5);
          setTopicThreshold(schedulerData.topicThreshold || 2);
          
          // Set prompt data based on mode
          if (schedulerData.promptMode === 'list' && schedulerData.topicList) {
            try {
              const topics = typeof schedulerData.topicList === 'string' 
                ? JSON.parse(schedulerData.topicList) 
                : schedulerData.topicList;
              setTopicList(Array.isArray(topics) ? topics : [{ title: '', description: '' }]);
            } catch {
              setTopicList([{ title: '', description: '' }]);
            }
          } else {
            setPrompt(schedulerData.prompt);
          }
          
          if (schedulerData.promptMode === 'perplexity') {
            setPerplexitySystemPrompt(schedulerData.perplexitySystemPrompt || '');
          }
          
          // 크론 표현식을 파싱하여 요일과 시간 설정
          const { days, times } = parseCronExpression(schedulerData.cronExpression);
          setSelectedDays(days);
          setScheduleTimes(times);
        } else {
          alert("스케줄러를 불러올 수 없습니다.");
          router.push("/admin/scheduler");
        }

        if (categoriesRes.ok) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
        alert("데이터를 불러오는데 실패했습니다.");
        router.push("/admin/scheduler");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    setCategoryId(selectedId);
    // 카테고리 변경 시 생성된 대본 초기화
    setGeneratedScript("");
    setTestResult(null);
  };

  const addTopic = () => {
    setTopicList([...topicList, { title: '', description: '' }]);
  };

  const removeTopic = (index: number) => {
    if (topicList.length > 1) {
      setTopicList(topicList.filter((_, i) => i !== index));
    }
  };

  const updateTopic = (index: number, field: 'title' | 'description', value: string) => {
    const updatedList = [...topicList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setTopicList(updatedList);
  };

  const generateScript = async () => {
    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    let contentPrompt = prompt;
    if (promptMode === 'perplexity' && !perplexitySystemPrompt) {
      alert("Perplexity 시스템 프롬프트를 입력해주세요.");
      return;
    } else if (promptMode === 'list' && (!topicList.length || !topicList[0].title)) {
      alert("최소 하나의 주제를 입력해주세요.");
      return;
    } else if (promptMode === 'single' && !prompt) {
      alert("콘텐츠 프롬프트를 입력해주세요.");
      return;
    }

    // For list mode, use the first topic for preview
    if (promptMode === 'list') {
      contentPrompt = topicList[0].title + (topicList[0].description ? `: ${topicList[0].description}` : '');
    }

    setScriptGenerating(true);
    setGeneratedScript("");

    try {
      const res = await fetch("/api/admin/scheduler/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId,
          contentPrompt: promptMode === 'list' ? contentPrompt : prompt,
          promptMode,
          usePerplexity: promptMode === 'perplexity',
          perplexitySystemPrompt: promptMode === 'perplexity' ? perplexitySystemPrompt : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedScript(data.script);
      } else {
        alert(`대본 생성 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("대본 생성 중 오류가 발생했습니다:", error);
      alert("대본 생성 중 오류가 발생했습니다.");
    } finally {
      setScriptGenerating(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !categoryId || selectedDays.length === 0 || scheduleTimes.length === 0) {
      alert("모든 필수 필드를 채워주세요.");
      return;
    }

    // Validate based on prompt mode
    if (promptMode === 'single' && !prompt) {
      alert("콘텐츠 프롬프트를 입력해주세요.");
      return;
    } else if (promptMode === 'perplexity' && (!prompt || !perplexitySystemPrompt)) {
      alert("검색 프롬프트와 시스템 프롬프트를 모두 입력해주세요.");
      return;
    } else if (promptMode === 'list') {
      const validTopics = topicList.filter(t => t.title.trim());
      if (validTopics.length === 0) {
        alert("최소 하나의 주제를 입력해주세요.");
        return;
      }
    }

    const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId.toString()));
    if (!selectedCategory?.presenterVoiceId) {
      alert("선택한 카테고리에 진행자 음성 ID가 설정되어 있지 않습니다. 카테고리 관리에서 먼저 설정해주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/scheduler/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          categoryId,
          prompt: promptMode === 'list' ? JSON.stringify(topicList.filter(t => t.title.trim())) : prompt,
          promptMode,
          usePerplexity: promptMode === 'perplexity',
          perplexitySystemPrompt: promptMode === 'perplexity' ? perplexitySystemPrompt : null,
          topicList: promptMode === 'list' ? topicList.filter(t => t.title.trim()) : null,
          currentTopicIndex: scheduler?.currentTopicIndex || 0,
          cronExpression: generateCronExpression(),
          publishDateOffset,
          isActive,
          autoGenerateTopics: promptMode === 'list' ? autoGenerateTopics : false,
          autoGenerateCount: promptMode === 'list' ? autoGenerateCount : 5,
          topicThreshold: promptMode === 'list' ? topicThreshold : 2,
        }),
      });

      if (res.ok) {
        alert("스케줄러가 성공적으로 수정되었습니다.");
        router.push("/admin/scheduler");
      } else {
        const errorData = await res.json();
        alert(
          `스케줄러 수정에 실패했습니다: ${
            errorData.error || "알 수 없는 오류"
          }`
        );
      }
    } catch (error) {
      console.error("스케줄러 수정 중 오류가 발생했습니다:", error);
      alert("스케줄러 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!generatedScript) {
      alert("먼저 대본을 생성해주세요.");
      return;
    }

    const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId.toString()));
    if (!selectedCategory?.presenterVoiceId) {
      alert("선택한 카테고리에 진행자 음성 ID가 설정되어 있지 않습니다.");
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId.toString()));
      
      const res = await fetch("/api/admin/scheduler/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: generatedScript,
          categoryName: selectedCategory!.name,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTestResult({
          audioUrl: data.audioUrl,
          thumbnailUrl: data.thumbnailUrl,
          duration: data.duration,
        });
      } else {
        alert(`테스트 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("테스트 중 오류가 발생했습니다:", error);
      alert("테스트 중 오류가 발생했습니다.");
    } finally {
      setTestLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!scheduler) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">스케줄러를 찾을 수 없습니다.</p>
          <Link
            href="/admin/scheduler"
            className="text-indigo-600 hover:text-indigo-500 mt-2 inline-block"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">스케줄러 수정</h2>
        <Link
          href="/admin/scheduler"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          목록으로 돌아가기
        </Link>
      </div>

      {/* 스케줄러 정보 */}
      <div className="max-w-2xl mb-6">
        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">총 생성:</span>{" "}
            <span className="text-gray-900">{scheduler.totalGenerated}개</span>
          </div>
          {scheduler.lastRunAt && (
            <div>
              <span className="font-medium text-gray-700">마지막 실행:</span>{" "}
              <span className="text-gray-900">
                {new Date(scheduler.lastRunAt).toLocaleString("ko-KR")}
              </span>
            </div>
          )}
          {scheduler.nextRunAt ? (
            <div>
              <span className="font-medium text-gray-700">다음 실행:</span>{" "}
              <span className="text-gray-900">
                {new Date(scheduler.nextRunAt).toLocaleString("ko-KR")}
              </span>
            </div>
          ) : scheduler.isActive ? (
            <div>
              <span className="font-medium text-red-600">
                ⚠️ 다음 실행 시간이 설정되지 않음
              </span>
              <p className="text-sm text-gray-600 mt-1">
                크론 표현식을 확인하고 저장해주세요.
              </p>
            </div>
          ) : null}
          <div>
            <span className="font-medium text-gray-700">생성일:</span>{" "}
            <span className="text-gray-900">
              {new Date(scheduler.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              스케줄러 이름 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="예: 일일 뉴스 브리핑"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              카테고리 *
            </label>
            <select
              id="category"
              name="category"
              value={categoryId}
              onChange={handleCategoryChange}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.isFree ? "(무료)" : "(유료)"}
                </option>
              ))}
            </select>
            
            {/* 선택된 카테고리의 진행자 정보 표시 */}
            {categoryId && (
              (() => {
                const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId.toString()));
                if (selectedCategory && selectedCategory.presenterName) {
                  return (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">
                            진행자: {selectedCategory.presenterName}
                          </h4>
                          {selectedCategory.presenterPersona && (
                            <p className="mt-1 text-sm text-blue-700">
                              페르소나: {selectedCategory.presenterPersona}
                            </p>
                          )}
                          {selectedCategory.presenterVoiceId && (
                            <p className="mt-1 text-sm text-blue-700">
                              음성 ID가 자동으로 적용됩니다.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              콘텐츠 생성 방식 *
            </label>
            <div className="space-y-3 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={promptMode === 'single'}
                  onChange={(e) => setPromptMode(e.target.value as PromptMode)}
                  className="mr-2"
                />
                <span className="text-sm">단일 프롬프트 (기본)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="perplexity"
                  checked={promptMode === 'perplexity'}
                  onChange={(e) => setPromptMode(e.target.value as PromptMode)}
                  className="mr-2"
                />
                <span className="text-sm">Perplexity 웹 검색 모드</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="list"
                  checked={promptMode === 'list'}
                  onChange={(e) => setPromptMode(e.target.value as PromptMode)}
                  className="mr-2"
                />
                <span className="text-sm">주제 리스트 모드</span>
              </label>
            </div>

            {/* List mode progress */}
            {promptMode === 'list' && scheduler && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  현재 진행 상황: {scheduler.currentTopicIndex + 1} / {topicList.filter(t => t.title.trim()).length} 번째 주제 처리 중
                </p>
              </div>
            )}

            {/* Single mode prompt */}
            {promptMode === 'single' && (
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                  콘텐츠 프롬프트 *
                </label>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      id="prompt"
                      name="prompt"
                      rows={5}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="예: 최신 AI 기술 트렌드에 대해 설명해주세요. 초보자도 이해하기 쉽게 설명하고, 실생활 예시를 포함해주세요."
                    ></textarea>
                  </div>
                  <button
                    type="button"
                    onClick={generateScript}
                    disabled={scriptGenerating || !categoryId || !prompt}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                  >
                    {scriptGenerating ? "생성 중..." : "대본 생성"}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  AI 대본 생성을 위한 프롬프트입니다. 주제, 설명 방법 등을 포함해주세요.
                </p>
              </div>
            )}

            {/* Perplexity mode prompts */}
            {promptMode === 'perplexity' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="perplexity-prompt" className="block text-sm font-medium text-gray-700">
                    웹 검색 프롬프트 *
                  </label>
                  <textarea
                    id="perplexity-prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="예: 2024년 최신 AI 기술 트렌드, GPT-5 출시 소식"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">
                    웹에서 검색할 주제나 키워드를 입력하세요.
                  </p>
                </div>
                <div>
                  <label htmlFor="perplexity-system" className="block text-sm font-medium text-gray-700">
                    시스템 프롬프트 *
                  </label>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        id="perplexity-system"
                        rows={3}
                        value={perplexitySystemPrompt}
                        onChange={(e) => setPerplexitySystemPrompt(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 최신 정보를 바탕으로 초보자도 이해하기 쉽게 설명해주세요. 실제 사례와 함께 설명하고, 미래 전망도 포함해주세요."
                      ></textarea>
                    </div>
                    <button
                      type="button"
                      onClick={generateScript}
                      disabled={scriptGenerating || !categoryId || !prompt || !perplexitySystemPrompt}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                    >
                      {scriptGenerating ? "생성 중..." : "대본 생성"}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    검색 결과를 어떻게 활용할지 지시하는 프롬프트입니다.
                  </p>
                </div>
              </div>
            )}

            {/* List mode topics */}
            {promptMode === 'list' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    주제 리스트 *
                  </label>
                  <button
                    type="button"
                    onClick={addTopic}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    주제 추가
                  </button>
                </div>
                <div className="space-y-3">
                  {topicList.map((topic, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={topic.title}
                            onChange={(e) => updateTopic(index, 'title', e.target.value)}
                            placeholder="주제 제목 (필수)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <textarea
                            value={topic.description || ''}
                            onChange={(e) => updateTopic(index, 'description', e.target.value)}
                            placeholder="주제 설명 (선택)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        {topicList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTopic(index)}
                            className="inline-flex items-center p-1 border border-transparent rounded text-red-600 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* 자동 주제 생성 설정 */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">자동 주제 생성 설정</h4>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="autoGenerateTopics"
                        type="checkbox"
                        checked={autoGenerateTopics}
                        onChange={(e) => setAutoGenerateTopics(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoGenerateTopics" className="ml-2 block text-sm text-blue-800">
                        주제가 부족하면 자동으로 새 주제 생성
                      </label>
                    </div>

                    {autoGenerateTopics && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            자동 생성 기준 (개 이하)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={topicThreshold}
                            onChange={(e) => setTopicThreshold(parseInt(e.target.value) || 2)}
                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            한 번에 생성할 개수
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={autoGenerateCount}
                            onChange={(e) => setAutoGenerateCount(parseInt(e.target.value) || 5)}
                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-blue-700">
                      {autoGenerateTopics
                        ? `남은 주제가 ${topicThreshold}개 이하가 되면, 최근 생성된 10개 주제를 참고하여 ${autoGenerateCount}개의 새 주제를 자동 생성합니다.`
                        : "체크박스를 활성화하면 주제가 부족할 때 자동으로 새 주제를 생성합니다."
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-end gap-3">
                  <p className="flex-1 text-sm text-gray-500">
                    각 주제는 스케줄에 따라 순차적으로 처리됩니다. 한 번에 하나씩 사용되며, 모든 주제가 소진되면 알림을 받습니다.
                  </p>
                  <button
                    type="button"
                    onClick={generateScript}
                    disabled={scriptGenerating || !categoryId || !topicList[0]?.title}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scriptGenerating ? "생성 중..." : "첫 주제로 테스트"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 생성된 대본 표시 */}
          {generatedScript && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생성된 대본
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {generatedScript}
                </pre>
              </div>
            </div>
          )}

          {/* 테스트 섹션 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">오디오 테스트</h3>
              <button
                type="button"
                onClick={handleTest}
                disabled={testLoading || !generatedScript}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    생성 중...
                  </>
                ) : (
                  "테스트 실행"
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              생성된 대본을 카테고리의 진행자 음성으로 변환하여 미리 들어볼 수 있습니다.
            </p>

            {testResult && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {testResult.thumbnailUrl && (
                    <img
                      src={testResult.thumbnailUrl}
                      alt="테스트 썸네일"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">생성된 오디오</h4>
                    <div className="mb-3">
                      <audio controls className="w-full">
                        <source src={testResult.audioUrl} type="audio/mpeg" />
                        브라우저가 오디오를 지원하지 않습니다.
                      </audio>
                    </div>
                    <p className="text-sm text-gray-600">
                      재생 시간: 약 {Math.floor(testResult.duration / 60)}분 {testResult.duration % 60}초
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              실행 스케줄 *
            </label>
            
            {/* 요일 선택 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">요일 선택</p>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-2 rounded-md border text-sm font-medium ${
                      selectedDays.includes(day.value)
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 시간 설정 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">실행 시간</p>
                <button
                  type="button"
                  onClick={addScheduleTime}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  시간 추가
                </button>
              </div>
              <div className="space-y-2">
                {scheduleTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateScheduleTime(index, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {scheduleTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScheduleTime(index)}
                        className="inline-flex items-center p-1 border border-transparent rounded text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 생성된 크론 표현식 표시 */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-sm text-gray-600 mb-1">생성된 크론 표현식:</p>
              <code className="text-sm font-mono text-gray-800">{generateCronExpression()}</code>
              <p className="text-xs text-gray-500 mt-1">
                {scheduleTimes.length > 1 && "여러 시간 설정 시 별도의 스케줄러가 생성됩니다."}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="publishDateOffset" className="block text-sm font-medium text-gray-700">
              게시 일자 설정
            </label>
            <div className="mt-1 flex items-center space-x-3">
              <input
                type="number"
                id="publishDateOffset"
                name="publishDateOffset"
                min="0"
                max="30"
                value={publishDateOffset}
                onChange={(e) => setPublishDateOffset(parseInt(e.target.value) || 0)}
                className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <span className="text-sm text-gray-700">일 후 게시</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              스케줄러 실행 시점을 기준으로 며칠 후에 게시할지 설정합니다. 
              (0: 실행 당일, 1: 실행일 다음날, 2: 실행일 이틀 후 등)
            </p>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              활성화 상태
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/scheduler"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "수정 중..." : "스케줄러 수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}