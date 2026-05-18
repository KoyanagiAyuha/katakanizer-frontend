'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';
import { PageLoadingSpinner, InlineLoadingSpinner, ButtonLoadingSpinner } from '../../ui/LoadingSpinner';
import { ConversionHistoryItem, WordMapping } from '../../../types';
import { formatApiHistory, getLanguageLabel } from '../../../utils/formatting';
import { LANGUAGE_FILTER_OPTIONS } from '../../../utils/constants';

type SearchResult = ConversionHistoryItem & { username?: string };

interface SearchPageProps {
  onHistoryClick?: (item: SearchResult) => void;
}

export default function SearchPage({ onHistoryClick }: SearchPageProps) {
  const { user } = useAuth();
  const { getRecentHistory } = useApiService();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allHistory, setAllHistory] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchOffset, setSearchOffset] = useState(0);
  const ITEMS_PER_PAGE = 20;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 初期化時に履歴を読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        const apiHistory = await getRecentHistory(ITEMS_PER_PAGE, 0);
        const formattedHistory: SearchResult[] = apiHistory.map(item => ({
          ...formatApiHistory(item),
          username: item.username,
        }));

        setSearchResults(formattedHistory);
        setAllHistory(formattedHistory);
        setHasMore(apiHistory.length === ITEMS_PER_PAGE);

        const savedSearches = localStorage.getItem('recent_searches');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        setSearchResults([]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 無限スクロール用の追加読み込み関数
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const newOffset = searchOffset + ITEMS_PER_PAGE;
      const newApiResults = await getRecentHistory(ITEMS_PER_PAGE, newOffset);

      if (newApiResults.length === 0) {
        setHasMore(false);
        return;
      }

      const formattedNewResults: SearchResult[] = newApiResults.map(item => ({
        ...formatApiHistory(item),
        username: item.username,
      }));

      setSearchResults(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewResults = formattedNewResults.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewResults];
      });
      setSearchOffset(newOffset);
      setHasMore(newApiResults.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load more results:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, searchOffset, getRecentHistory]);

  // スクロールイベントリスナー
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !isLoadingMore) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMore]);

  // 検索実行（ローカルフィルタリング）
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() && !selectedLanguage) {
      setSearchResults(allHistory);
      return;
    }

    setIsLoading(true);
    try {
      const filtered = allHistory.filter(item => {
        const matchesSearch = !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.text.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLanguage = !selectedLanguage || item.language === selectedLanguage;

        return matchesSearch && matchesLanguage;
      });

      setSearchResults(filtered);

      if (searchQuery.trim()) {
        const updatedSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recent_searches', JSON.stringify(updatedSearches));
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedLanguage, allHistory, recentSearches]);

  // エンターキーで検索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 最近の検索をクリック
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // 検索クリア
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedLanguage('');
    setSearchResults(allHistory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 md:ml-64">
      {/* 検索ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">変換履歴を検索</h1>
          
          {/* 検索バー */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-600"
                placeholder="タイトルや内容で検索..."
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* 言語フィルター */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-gray-900"
            >
              {LANGUAGE_FILTER_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <ButtonLoadingSpinner />
                  <span className="ml-2">検索中...</span>
                </div>
              ) : (
                '検索'
              )}
            </button>
          </div>

          {/* 最近の検索 */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">最近の検索</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(query)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                  >
                    {query}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recent_searches');
                  }}
                  className="px-3 py-1.5 text-gray-500 hover:text-red-600 text-sm transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 検索結果 */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* 結果数表示 */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {searchQuery ? `"${searchQuery}" の検索結果: ${searchResults.length}件` : `最新の変換: ${searchResults.length}件`}
          </div>
        </div>

        {isInitialLoading || isLoading ? (
          <PageLoadingSpinner />
        ) : searchResults.length > 0 ? (
          <>
            <div className="space-y-4">
              {searchResults.map((item) => (
                <article 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => onHistoryClick && onHistoryClick(item)}
                >
                  {/* カードヘッダー */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{user?.username?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">@{user?.username}</div>
                          <div className="text-gray-500 text-xs">{item.timestamp}</div>
                        </div>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                        {getLanguageLabel(item.language)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  </div>
                  
                  {/* 原文 */}
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <div className="text-gray-600 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                        {item.text}
                      </div>
                    </div>
                    
                    {/* 変換プレビュー */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
                      <div className="text-indigo-900" style={{ lineHeight: '2.5' }}>
                        <ruby className="text-base">
                          {item.result.word_mappings?.slice(0, 8).map((mapping: WordMapping, index: number) => (
                            <React.Fragment key={index}>
                              <span>{mapping.line}</span>
                              <rt className="text-xs text-indigo-600">{mapping.casual}</rt>
                              {index < Math.min(item.result.word_mappings.length - 1, 7) ? ' ' : ''}
                            </React.Fragment>
                          ))}
                          {item.result.word_mappings?.length > 8 && <span className="text-gray-400">...</span>}
                        </ruby>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <InlineLoadingSpinner text="さらに読み込み中..." />
            )}
            
            {/* End of results indicator */}
            {!hasMore && searchResults.length > 0 && (searchQuery.trim() || selectedLanguage) && (
              <div className="text-center py-8">
                <p className="text-gray-500">すべての検索結果を表示しました</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery ? '検索結果が見つかりません' : '変換履歴がありません'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? '別のキーワードで検索してみてください' 
                : '最初の変換を作成して、検索できるようになりましょう！'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}