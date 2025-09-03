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

export default function CreateAudioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");
  const [publishDate, setPublishDate] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [script, setScript] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id);
          setSelectedCategory(data[0]);
        }
      } catch (error) {
        console.error("카테고리를 불러오는데 실패했습니다:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    setCategoryId(selectedId);
    const category = categories.find((cat) => cat.id === selectedId);
    setSelectedCategory(category || null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!audioFile || !categoryId) {
      alert("모든 필드를 채워주세요.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("categoryId", categoryId.toString());
      formData.append("publishDate", publishDate);
      formData.append("audioFile", audioFile);
      if (thumbnailFile) {
        formData.append("thumbnailFile", thumbnailFile);
      }
      formData.append("description", description);
      formData.append("script", script);

      const res = await fetch("/api/admin/audio", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("오디오가 성공적으로 생성되었습니다.");
        router.push("/admin");
      } else {
        const errorData = await res.json();
        alert(
          `오디오 생성에 실패했습니다: ${
            errorData.message || "알 수 없는 오류"
          }`
        );
      }
    } catch (error) {
      console.error("오디오 생성 중 오류가 발생했습니다:", error);
      alert("오디오 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">새 오디오 생성</h2>
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
              오디오 파일 *
            </label>
            <input
              type="file"
              id="audioFile"
              name="audioFile"
              accept="audio/*"
              onChange={(e) =>
                setAudioFile(e.target.files ? e.target.files[0] : null)
              }
              required
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <p className="mt-1 text-sm text-gray-500">
              MP3, WAV, M4A 등 오디오 파일 형식을 지원합니다.
            </p>
          </div>

          <div>
            <label
              htmlFor="thumbnailFile"
              className="block text-sm font-medium text-gray-700"
            >
              썸네일 이미지
            </label>
            <input
              type="file"
              id="thumbnailFile"
              name="thumbnailFile"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <p className="mt-1 text-sm text-gray-500">
              JPG, PNG, GIF 등 이미지 파일 형식을 지원합니다.
            </p>
            {thumbnailPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  썸네일 미리보기
                </p>
                <div className="relative h-48 w-48 rounded-lg overflow-hidden">
                  <Image
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              오디오 설명 (100자 이내)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="오디오 설명을 100자 이내로 입력하세요..."
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="script"
              className="block text-sm font-medium text-gray-700"
            >
              대본 (마크다운 지원)
            </label>
            <textarea
              id="script"
              name="script"
              rows={10}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="대본을 마크다운 형식으로 입력하세요..."
            ></textarea>
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
              {loading ? "생성 중..." : "오디오 생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
