"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  isFree: boolean;
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const resolvedParams = await params;
        setCategoryId(resolvedParams.id);

        const res = await fetch(`/api/admin/categories/${resolvedParams.id}`);
        if (res.ok) {
          const categoryData = await res.json();
          setCurrentCategory(categoryData);
          setName(categoryData.name);
          setIsFree(categoryData.isFree);
        } else {
          alert("카테고리를 찾을 수 없습니다.");
          router.push("/admin/categories");
        }
      } catch (error) {
        console.error("카테고리를 불러오는데 실패했습니다:", error);
        alert("카테고리를 불러오는데 실패했습니다.");
        router.push("/admin/categories");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategory();
  }, [params, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("카테고리 이름을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), isFree }),
      });

      if (res.ok) {
        alert("카테고리가 성공적으로 수정되었습니다.");
        router.push("/admin/categories");
      } else {
        const errorData = await res.json();
        alert(
          `카테고리 수정에 실패했습니다: ${
            errorData.message || "알 수 없는 오류"
          }`
        );
      }
    } catch (error) {
      console.error("카테고리 수정 중 오류가 발생했습니다:", error);
      alert("카테고리 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">카테고리를 찾을 수 없습니다.</p>
          <Link
            href="/admin/categories"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
        <h2 className="text-xl font-semibold text-gray-900">카테고리 수정</h2>
        <Link
          href="/admin/categories"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          목록으로 돌아가기
        </Link>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              카테고리 이름 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="카테고리 이름을 입력하세요"
            />
          </div>

          <div className="flex items-center">
            <input
              id="isFree"
              name="isFree"
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isFree"
              className="ml-2 block text-sm text-gray-900"
            >
              무료 카테고리
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  카테고리 타입 안내
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    무료 카테고리로 설정하면 해당 카테고리의 오디오는 모든
                    사용자가 무료로 들을 수 있습니다. 체크하지 않으면 유료
                    카테고리로 설정됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/categories"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "수정 중..." : "카테고리 수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
