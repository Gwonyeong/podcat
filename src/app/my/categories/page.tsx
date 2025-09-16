"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  isFree: boolean;
  presenterImage: string | null;
}

export default function CategorySelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [userRes, categoriesRes] = await Promise.all([
        fetch('/api/user/interested-categories'),
        fetch('/api/admin/categories')
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserPlan(userData.plan);
        setSelectedCategories(userData.interestedCategories.map((cat: { id: number }) => cat.id));
      }

      if (categoriesRes.ok) {
        const categories = await categoriesRes.json();
        setAvailableCategories(categories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const category = availableCategories.find(cat => cat.id === categoryId);

    // 무료 사용자가 유료 카테고리를 선택하려고 하는 경우 방지
    if (userPlan === 'free' && category && !category.isFree) {
      alert('프리미엄 요금제에서만 이용 가능한 카테고리입니다.');
      return;
    }

    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      const maxCategories = userPlan === 'free' ? 3 : Infinity;
      if (selectedCategories.length >= maxCategories) {
        alert(`${userPlan === 'free' ? '무료' : '프로'} 요금제에서는 최대 ${maxCategories}개의 카테고리만 선택할 수 있습니다.`);
        return;
      }
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/interested-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: selectedCategories })
      });

      if (response.ok) {
        alert('관심 카테고리가 저장되었습니다.');
        router.push('/my');
      } else {
        const error = await response.json();
        alert(error.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">관심 카테고리 선택</h1>
            <p className="text-sm text-gray-500 mt-1">
              {userPlan === 'free' 
                ? `무료 요금제: 최대 3개까지 선택 가능 (${selectedCategories.length}/3)`
                : `프로 요금제: 제한 없음 (${selectedCategories.length}개 선택됨)`
              }
            </p>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            const isDisabled = userPlan === 'free' && !category.isFree;
            return (
              <div
                key={category.id}
                onClick={() => !isDisabled && toggleCategory(category.id)}
                className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                  isDisabled
                    ? 'cursor-not-allowed opacity-50 bg-gray-100 border-gray-200'
                    : `cursor-pointer hover:shadow-md ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`
                }`}
              >
                {/* 선택 표시 또는 프리미엄 잠금 표시 */}
                {isSelected && !isDisabled && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
                {isDisabled && (
                  <div className="absolute top-3 right-3 bg-gray-400 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                )}

                {/* 카테고리 콘텐츠 */}
                <div className="p-6">
                  {/* 진행자 이미지 */}
                  <div className="flex justify-center mb-4">
                    {category.presenterImage ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <Image
                          src={category.presenterImage}
                          alt={`${category.name} 진행자`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <svg className="w-10 h-10 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 카테고리 정보 */}
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDisabled ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>

                    {/* 요금제 표시 */}
                    <div className="flex justify-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        category.isFree
                          ? 'bg-blue-100 text-blue-800'
                          : isDisabled
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {category.isFree ? '무료' : '유료'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 저장 버튼 */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3 rounded-full text-white font-medium shadow-lg transition-all duration-200 ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
            }`}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </div>
            ) : (
              '저장하기'
            )}
          </button>
        </div>

        {/* 하단 여백 */}
        <div className="h-24"></div>
      </div>
    </div>
  );
}