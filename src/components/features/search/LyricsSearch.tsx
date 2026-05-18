'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../utils/config';
import { LANGUAGE_FILTER_OPTIONS } from '../../../utils/constants';
import { getLanguageLabel } from '../../../utils/formatting';

interface LyricsEntry {
  id: number;
  title: string;
  original_text: string;
  casual_katakana: string;
  formal_katakana: string;
  language: string;
  created_at: string;
}

interface LyricsSearchProps {
  refreshTrigger?: number;
}

export default function LyricsSearch({ refreshTrigger }: LyricsSearchProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [results, setResults] = useState<LyricsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (refreshTrigger) {
      loadRecentLyrics();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (!hasSearched) {
      loadRecentLyrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecentLyrics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/lyrics?limit=10`);

      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const data: LyricsEntry[] = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      await loadRecentLyrics();
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        ...(language && { language }),
      });

      const response = await fetch(`${API_BASE_URL}/api/lyrics/search?${params}`);

      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const data: LyricsEntry[] = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {hasSearched ? '検索結果' : '最近の歌詞'}
      </h2>

      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="タイトル、歌詞、カタカナで検索..."
              disabled={isLoading}
            />
          </div>
          <div className="md:w-48">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              {LANGUAGE_FILTER_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="md:w-24 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {isLoading ? '...' : '検索'}
          </button>
        </div>

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setLanguage('');
              loadRecentLyrics();
              setHasSearched(false);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            検索をクリア
          </button>
        )}
      </form>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 結果表示 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          読み込み中...
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {hasSearched ? '検索結果が見つかりませんでした' : '歌詞がまだありません'}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((entry) => (
            <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {getLanguageLabel(entry.language)}
                  </span>
                  <span>{new Date(entry.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">原文:</p>
                <p className="text-gray-900 whitespace-pre-wrap">{entry.original_text}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">カジュアル読み:</p>
                  <p className="text-blue-900 bg-blue-50 p-3 rounded whitespace-pre-wrap">
                    {entry.casual_katakana}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">フォーマル読み:</p>
                  <p className="text-green-900 bg-green-50 p-3 rounded whitespace-pre-wrap">
                    {entry.formal_katakana}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}