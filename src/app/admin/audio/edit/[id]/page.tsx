"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  isFree: boolean;
  presenterImage?: string | null;
}

interface Audio {
  id: number;
  title: string;
  publishDate: string;
  filePath: string;
  category: Category;
}

export default function EditAudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");
  const [publishDate, setPublishDate] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<Audio | null>(null);
  const [audioId, setAudioId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        setAudioId(resolvedParams.id);

        // 카테고리 목록 가져오기
        const categoriesRes = await fetch("/api/admin/categories");
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        // 오디오 정보 가져오기
        const audioRes = await fetch(`/api/admin/audio/${resolvedParams.id}`);
        if (audioRes.ok) {
          const audioData = await audioRes.json();
          setCurrentAudio(audioData);
          setTitle(audioData.title);
          setCategoryId(audioData.categoryId);
          setPublishDate(audioData.publishDate.split("T")[0]); // YYYY-MM-DD 형식으로 변환

          const initialCategory = categoriesData.find(
            (cat: Category) => cat.id === audioData.categoryId
          );
          setSelectedCategory(initialCategory || null);
        } else {
          alert("오디오를 찾을 수 없습니다.");
          router.push("/admin");
        }
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
        alert("데이터를 불러오는데 실패했습니다.");
        router.push("/admin");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [params, router]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    setCategoryId(selectedId);
    const category = categories.find((cat) => cat.id === selectedId);
    setSelectedCategory(category || null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("categoryId", categoryId.toString());
      formData.append("publishDate", publishDate);
      if (audioFile) {
        formData.append("audioFile", audioFile);
      }

      const res = await fetch(`/api/admin/audio/${audioId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        alert("오디오가 성공적으로 수정되었습니다.");
        router.push("/admin");
      } else {
        const errorData = await res.json();
        alert(
          `오디오 수정에 실패했습니다: ${
            errorData.message || "알 수 없는 오류"
          }`
        );
      }
    } catch (error) {
      console.error("오디오 수정 중 오류가 발생했습니다:", error);
      alert("오디오 수정 중 오류가 발생했습니다.");
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

  if (!currentAudio) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">오디오를 찾을 수 없습니다.</p>
          <Link
            href="/admin"
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
        <h2 className="text-xl font-semibold text-gray-900">오디오 수정</h2>
        <Link
          href="/admin"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          목록으로 돌아가기
        </Link>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="오디오 제목을 입력하세요"
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
          </div>

          {selectedCategory && selectedCategory.presenterImage && (
            <div className="mt-4">
              <p className="block text-sm font-medium text-gray-700 mb-2">
                진행자 이미지 미리보기
              </p>
              <div className="relative h-48 w-48 rounded-lg overflow-hidden">
                <Image
                  src={selectedCategory.presenterImage}
                  alt={selectedCategory.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="publishDate"
              className="block text-sm font-medium text-gray-700"
            >
              게시일 *
            </label>
            <input
              type="date"
              id="publishDate"
              name="publishDate"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="audioFile"
              className="block text-sm font-medium text-gray-700"
            >
              오디오 파일
            </label>
            <input
              type="file"
              id="audioFile"
              name="audioFile"
              accept="audio/*"
              onChange={(e) =>
                setAudioFile(e.target.files ? e.target.files[0] : null)
              }
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <p className="mt-1 text-sm text-gray-500">
              새 파일을 선택하지 않으면 기존 파일이 유지됩니다.
            </p>
            {currentAudio.filePath && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">현재 파일:</p>
                <a
                  href={currentAudio.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  기존 파일 듣기
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/admin"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "수정 중..." : "오디오 수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
