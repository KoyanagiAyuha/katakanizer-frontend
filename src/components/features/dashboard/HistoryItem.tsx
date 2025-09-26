'use client';

import React from 'react';

interface HistoryItemProps {
  item: any;
  user: any;
  onClick: () => void;
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
}

export default function HistoryItem({ item, user, onClick, onFavoriteToggle }: HistoryItemProps) {
  const getLanguageDisplay = (language: string) => {
    const languages = {
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
    return languages[language as keyof typeof languages] || language;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(item.id, !item.is_favorite);
    }
  };

  return (
    <article
      className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">@{item.username || user?.username}</div>
              <div className="text-gray-500 text-xs">{item.timestamp}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFavoriteClick}
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
            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
              {getLanguageDisplay(item.language)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
      </div>

      {/* Original Text */}
      <div className="px-6 pb-4">
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="text-gray-600 leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {item.text}
          </div>
        </div>

        {/* Conversion Preview */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
          <div className="text-indigo-900 text-base" style={{ lineHeight: '2.5' }}>
            {item.result.word_mappings?.slice(0, 5).map((mapping: any, index: number) => (
              <ruby key={index} className="mr-1">
                <span>{mapping.line}</span>
                <rt className="text-xs">{mapping.casual}</rt>
              </ruby>
            ))}
            {item.result.word_mappings?.length > 5 && (
              <span className="text-gray-400 text-sm">
                ...({item.result.word_mappings.length - 5} more phrases)
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}