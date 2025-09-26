'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';

interface WordMapping {
  line: string;
  casual: string;
  formal: string;
}

interface SearchResult {
  id: number;
  title: string;
  language: string;
  timestamp: string;
  result: {
    title: string;
    word_mappings: WordMapping[];
  };
}

interface SearchPageProps {
  onHistoryClick?: (item: SearchResult) => void;
}

export default function SearchPage({ onHistoryClick }: SearchPageProps) {
  const { user } = useAuth();
  const { searchHistory } = useApiService();
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

  // 初期化時に全履歴を読み込み
  useEffect(() => {
    const loadAllHistory = async () => {
      try {
        // localStorageから履歴を読み込み
        const savedHistory = localStorage.getItem('katakanizer_history');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          setAllHistory(history);
          setSearchResults(history.slice(0, 20)); // 最初は最新20件を表示
        }

        // 最近の検索履歴を読み込み
        const savedSearches = localStorage.getItem('recent_searches');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    loadAllHistory();
  }, []);

  // 無限スクロール用の追加検索関数
  const loadMoreSearch = async () => {
    if (isLoadingMore || !hasMore || (!searchQuery.trim() && !selectedLanguage)) return;
    
    setIsLoadingMore(true);
    try {
      const newApiResults = await searchHistory(searchQuery || '', selectedLanguage || undefined, searchOffset);
      
      if (newApiResults.length === 0) {
        setHasMore(false);
        return;
      }

      // API結果をフロントエンド形式に変換
      const formattedNewResults = newApiResults.map(apiItem => ({
        id: apiItem.id,
        title: apiItem.title,
        text: apiItem.original_text,
        language: apiItem.language,
        timestamp: new Date(apiItem.created_at).toLocaleString('ja-JP'),
        result: {
          title: apiItem.title,
          word_mappings: apiItem.word_mappings
        }
      }));

      // 重複を除いて追加
      const existingIds = new Set(searchResults.map(item => item.id));
      const uniqueNewResults = formattedNewResults.filter(item => !existingIds.has(item.id));

      const updatedResults = [...searchResults, ...uniqueNewResults];
      setSearchResults(updatedResults);
      setSearchOffset(searchOffset + ITEMS_PER_PAGE);
      setHasMore(newApiResults.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load more search results:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // スクロールイベントリスナー
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // 画面の底から200px以内にスクロールしたら次のページを読み込み
      if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !isLoadingMore && (searchQuery.trim() || selectedLanguage)) {
        loadMoreSearch();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, searchOffset, searchResults, searchQuery, selectedLanguage]);

  // 検索実行
  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedLanguage) {
      setSearchResults(allHistory.slice(0, 20));
      setHasMore(false);
      setSearchOffset(0);
      return;
    }

    setIsLoading(true);
    setSearchOffset(0);
    setHasMore(true);
    try {
      // ローカル検索を実行
      const localResults = allHistory.filter(item => {
        const matchesSearch = !searchQuery.trim() || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.text.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesLanguage = !selectedLanguage || item.language === selectedLanguage;
        
        return matchesSearch && matchesLanguage;
      });

      setSearchResults(localResults);

      // 最近の検索に追加
      const updatedSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recent_searches', JSON.stringify(updatedSearches));

      // バックエンドAPI検索を実行
      try {
        const apiResults = await searchHistory(searchQuery || '', selectedLanguage || undefined, 0);
        setSearchOffset(ITEMS_PER_PAGE);
        setHasMore(apiResults.length === ITEMS_PER_PAGE);
        // APIの結果をマージして重複除去
        const combinedResults = [...localResults];
        apiResults.forEach(apiItem => {
          if (!localResults.some(localItem => localItem.id === apiItem.id)) {
            combinedResults.push({
              id: apiItem.id,
              title: apiItem.title,
              text: apiItem.original_text,
              language: apiItem.language,
              timestamp: new Date(apiItem.created_at).toLocaleString('ja-JP'),
              result: {
                title: apiItem.title,
                word_mappings: apiItem.word_mappings
              }
            });
          }
        });
        setSearchResults(combinedResults);
        setHasMore(apiResults.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error('API search failed:', error);
        // API失敗時はローカル検索結果のみ使用
        setSearchResults(localResults);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setSearchResults(allHistory.slice(0, 20));
  };

  const getLanguageLabel = (language: string) => {
    const labels: { [key: string]: string } = {
      en: '🇺🇸 英語',
      ko: '🇰🇷 韓国語',
      fr: '🇫🇷 フランス語',
      es: '🇪🇸 スペイン語',
      de: '🇩🇪 ドイツ語',
      it: '🇮🇹 イタリア語',
      pt: '🇵🇹 ポルトガル語',
      zh: '🇨🇳 中国語',
      ja: '🇯🇵 日本語'
    };
    return labels[language] || language;
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
              <option value="">全ての言語</option>
              <option value="en">🇺🇸 英語</option>
              <option value="ko">🇰🇷 韓国語</option>
              <option value="fr">🇫🇷 フランス語</option>
              <option value="es">🇪🇸 スペイン語</option>
              <option value="de">🇩🇪 ドイツ語</option>
              <option value="it">🇮🇹 イタリア語</option>
              <option value="pt">🇵🇹 ポルトガル語</option>
              <option value="zh">🇨🇳 中国語</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>
            
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  検索中...
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
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
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-600">さらに読み込み中...</span>
              </div>
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