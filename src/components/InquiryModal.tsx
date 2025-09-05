'use client';

import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INQUIRY_TYPES = [
  { value: 'feedback', label: '피드백' },
  { value: 'bug', label: '버그 신고' },
  { value: 'feature', label: '기능 제안' },
  { value: 'general', label: '일반 문의' },
  { value: 'account', label: '계정 문의' },
];

export default function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.content.trim()) {
      alert('문의 유형과 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ type: '', subject: '', content: '' });
        setTimeout(() => {
          setShowForm(false);
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '문의 접수에 실패했습니다.');
      }
    } catch (error) {
      console.error('문의 접수 오류:', error);
      setSubmitStatus('error');
      alert(error instanceof Error ? error.message : '문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setShowForm(false);
    setFormData({ type: '', subject: '', content: '' });
    setSubmitStatus('idle');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">문의하기</h2>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                Podcat을 이용해주셔서 감사합니다! <br />
                궁금한 점이나 개선사항이 있으시면 언제든 문의해주세요.
              </p>
              
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                피드백 보내기
              </button>

              <div className="text-xs text-gray-500 text-center">
                소중한 의견을 통해 더 나은 서비스를 만들어가겠습니다.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-800 font-medium">문의가 성공적으로 접수되었습니다!</div>
                  <div className="text-green-600 text-sm mt-1">빠른 시일 내에 검토하도록 하겠습니다.</div>
                </div>
              )}

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  문의 유형 *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">문의 유형을 선택해주세요</option>
                  {INQUIRY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="문의 제목을 입력해주세요"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="문의 내용을 자세히 입력해주세요"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-blue-800 text-sm">
                    <p className="font-medium">답변 안내</p>
                    <p className="text-blue-700 text-xs mt-1">
                      로그인하신 이메일로 답변을 보내드립니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  뒤로가기
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '접수 중...' : '접수하기'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}