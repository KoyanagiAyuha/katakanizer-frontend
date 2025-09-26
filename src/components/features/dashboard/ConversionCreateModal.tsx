'use client';

import React from 'react';
import { ButtonLoadingSpinner } from '../../ui/LoadingSpinner';

interface ConversionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  setText: (text: string) => void;
  title: string;
  setTitle: (title: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
  onConvert: () => void;
}

export default function ConversionCreateModal({
  isOpen,
  onClose,
  text,
  setText,
  title,
  setTitle,
  language,
  setLanguage,
  isLoading,
  onConvert
}: ConversionCreateModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">新しい変換を作成</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Language Selection */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-800 mb-2">
                言語
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800 bg-white"
              >
                <option value="en">🇺🇸 英語 (English)</option>
                <option value="ko">🇰🇷 韓国語 (Korean)</option>
                <option value="fr">🇫🇷 フランス語 (French)</option>
                <option value="es">🇪🇸 スペイン語 (Spanish)</option>
                <option value="de">🇩🇪 ドイツ語 (German)</option>
                <option value="it">🇮🇹 イタリア語 (Italian)</option>
                <option value="pt">🇵🇹 ポルトガル語 (Portuguese)</option>
                <option value="zh">🇨🇳 中国語 (Chinese)</option>
                <option value="ja">🇯🇵 日本語 (Japanese)</option>
              </select>
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-2">
                タイトル（任意）
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800 bg-white"
                placeholder="例：歌詞、映画のセリフ、フレーズ集など..."
                disabled={isLoading}
              />
            </div>

            {/* Text Input */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-800 mb-2">
                変換するテキスト
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-800 bg-white"
                placeholder="変換したいテキストを入力してください..."
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                disabled={isLoading}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isLoading && text.trim()) {
                    onConvert();
                  }
                }}
                disabled={!text.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ButtonLoadingSpinner />
                    <span className="ml-2">変換中...</span>
                  </div>
                ) : (
                  '変換する'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}