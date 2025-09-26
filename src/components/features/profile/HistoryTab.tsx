'use client';

import React from 'react';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface HistoryTabProps {
  myHistory: any[];
  isLoading: boolean;
  onHistoryClick?: (item: any) => void;
  onDeleteClick: (id: number, title: string) => void;
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
}

export default function HistoryTab({
  myHistory,
  isLoading,
  onHistoryClick,
  onDeleteClick,
  onFavoriteToggle
}: HistoryTabProps) {
  const getLanguageLabel = (language: string) => {
    const labels: { [key: string]: string } = {
      'en': '🇺🇸 English',
      'ko': '🇰🇷 Korean',
      'fr': '🇫🇷 French',
      'es': '🇪🇸 Spanish',
      'de': '🇩🇪 German',
      'it': '🇮🇹 Italian',
      'pt': '🇵🇹 Portuguese',
      'zh': '🇨🇳 Chinese',
      'ja': '🇯🇵 Japanese'
    };
    return labels[language] || language;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">マイ変換履歴</h2>
        <LoadingSpinner size="md" text="読み込み中..." />
      </div>
    );
  }

  if (myHistory.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">マイ変換履歴</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">変換履歴がありません</h3>
          <p className="text-gray-500">最初の変換を作成してみましょう！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">マイ変換履歴</h2>

      <div className="space-y-4">
        {myHistory.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* カードヘッダー */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                    {getLanguageLabel(item.language)}
                  </span>
                  <span className="text-sm text-gray-500">{item.timestamp}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {onFavoriteToggle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavoriteToggle(item.id, !item.is_favorite);
                      }}
                      className={`p-2 rounded-full transition-all ${
                        item.is_favorite
                          ? 'text-red-500 bg-red-50 hover:bg-red-100'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      aria-label={item.is_favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={item.is_favorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(item.id, item.title);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="削除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            </div>

            {/* カードコンテンツ */}
            <div
              className="px-6 pb-6 cursor-pointer"
              onClick={() => onHistoryClick && onHistoryClick(item)}
            >
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-gray-600 leading-relaxed line-clamp-2 whitespace-pre-wrap text-sm">
                  {item.text}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                <div className="text-indigo-900 text-sm leading-relaxed">
                  {item.result.word_mappings?.slice(0, 3).map((mapping: any, index: number) => (
                    <ruby key={index} className="mr-1">
                      <span>{mapping.line}</span>
                      <rt className="text-xs">{mapping.casual}</rt>
                    </ruby>
                  ))}
                  {item.result.word_mappings?.length > 3 && (
                    <span className="text-gray-400 text-xs">
                      ...({item.result.word_mappings.length - 3} more)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}