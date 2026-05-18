'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApiService } from '../../../services/api';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { ConversionHistoryItem, WordMapping } from '../../../types';
import { formatApiHistory } from '../../../utils/formatting';
import { getLanguageLabel } from '../../../utils/formatting';

interface FavoritesTabProps {
  onHistoryClick?: (item: ConversionHistoryItem) => void;
}

export default function FavoritesTab({ onHistoryClick }: FavoritesTabProps) {
  const { getMyFavorites, removeFromFavorites } = useApiService();
  const [favorites, setFavorites] = useState<ConversionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMyFavorites(50, 0);
      const formattedFavorites = data.map(item => ({
        ...formatApiHistory(item),
        is_favorite: true,
      }));
      setFavorites(formattedFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getMyFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleFavoriteToggle = async (id: number) => {
    try {
      await removeFromFavorites(id);
      const updatedFavorites = favorites.filter(item => item.id !== id);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">お気に入り</h2>
        <LoadingSpinner size="md" text="読み込み中..." />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">お気に入り</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">お気に入りがありません</h3>
          <p className="text-gray-500">
            変換履歴のハートマークをクリックして<br />
            お気に入りに追加してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">お気に入り</h2>

      <div className="space-y-4">
        {favorites.map((item) => (
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(item.id);
                  }}
                  className="p-2 rounded-full text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                  aria-label="お気に入りから削除"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
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
                  {item.result.word_mappings?.slice(0, 3).map((mapping: WordMapping, index: number) => (
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
