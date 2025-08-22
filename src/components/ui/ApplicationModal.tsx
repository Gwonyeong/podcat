"use client";

import { useModalStore } from "@/store/modalStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useState } from "react";

// 샘플 주제들 (public/sample 폴더의 파일들 기반)
const AVAILABLE_TOPICS = ["글로벌 3대 뉴스", "테크", "라이프스타일"];

export default function ApplicationModal() {
  const {
    isApplicationModalOpen,
    formData,
    isSubmitting,
    closeApplicationModal,
    updateFormData,
    setSubmitting,
  } = useModalStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMaintenanceMessage, setShowMaintenanceMessage] = useState(false);

  // 모달이 닫힐 때 상태 리셋
  const handleCloseModal = () => {
    setShowMaintenanceMessage(false);
    setErrors({});
    closeApplicationModal();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "전화번호를 입력해주세요.";
    } else if (!/^[0-9-+\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (formData.interestedTopics.length === 0) {
      newErrors.interestedTopics = "최소 1개의 관심 주제를 선택해주세요.";
    } else if (formData.interestedTopics.length > 3) {
      newErrors.interestedTopics = "최대 3개까지만 선택 가능합니다.";
    }

    if (!formData.privacyConsent) {
      newErrors.privacyConsent = "개인정보 처리방침에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // 재정비 안내 메시지 표시
      setTimeout(() => {
        setSubmitting(false);
        setShowMaintenanceMessage(true);
      }, 1000);
    } catch (error) {
      console.error("Application submission error:", error);
      setSubmitting(false);
    }
  };

  const handleTopicToggle = (topic: string) => {
    const currentTopics = formData.interestedTopics;
    const updatedTopics = currentTopics.includes(topic)
      ? currentTopics.filter((t) => t !== topic)
      : currentTopics.length < 3
      ? [...currentTopics, topic]
      : currentTopics;

    updateFormData({ interestedTopics: updatedTopics });
  };

  return (
    <AnimatePresence>
      {isApplicationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                무료 체험 신청
              </h2>
              <button
                onClick={handleCloseModal}
                data-close-modal
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="application-form p-6">
              {showMaintenanceMessage ? (
                // 재정비 안내 메시지
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      서비스 준비 중
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      현재 더 좋은 서비스를 위해 재정비중입니다.
                      <br />
                      9월 1일부터 다시 팟캐스트를 전송해드릴게요!
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    확인
                  </button>
                </div>
              ) : (
                // 기존 신청 폼
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="이름을 입력해주세요"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* 전화번호 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        updateFormData({ phoneNumber: e.target.value })
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="010-1234-5678"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* 관심 주제 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      관심 있는 주제 <span className="text-red-500">*</span>
                      <span className="text-sm text-gray-500 ml-1">
                        (최대 3개)
                      </span>
                    </label>
                    <div className="space-y-2">
                      {AVAILABLE_TOPICS.map((topic) => {
                        const isSelected =
                          formData.interestedTopics.includes(topic);
                        const isDisabled =
                          !isSelected && formData.interestedTopics.length >= 3;

                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => handleTopicToggle(topic)}
                            disabled={isDisabled}
                            className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : isDisabled
                                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                          >
                            <span>{topic}</span>
                            {isSelected && (
                              <Check size={16} className="text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {errors.interestedTopics && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.interestedTopics}
                      </p>
                    )}
                  </div>

                  {/* 개인정보 처리방침 동의 */}
                  <div>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.privacyConsent}
                        onChange={(e) =>
                          updateFormData({ privacyConsent: e.target.checked })
                        }
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        <span className="text-red-500">*</span> 개인정보
                        처리방침에 동의합니다.
                        <br />
                        <span className="text-xs text-gray-500">
                          수집된 개인정보는 서비스 제공 목적으로만 사용되며,
                          동의 철회 시 즉시 삭제됩니다.
                        </span>
                      </span>
                    </label>
                    {errors.privacyConsent && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.privacyConsent}
                      </p>
                    )}
                  </div>

                  {/* 마케팅 수신 동의 */}
                  <div>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.marketingConsent}
                        onChange={(e) =>
                          updateFormData({ marketingConsent: e.target.checked })
                        }
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        마케팅 정보 수신에 동의합니다. (선택)
                        <br />
                        <span className="text-xs text-gray-500">
                          새로운 콘텐츠 및 이벤트 소식을 받아보실 수 있습니다.
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "신청 중..." : "무료 체험 신청하기"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
