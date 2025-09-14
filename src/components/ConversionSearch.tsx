'use client';

import { useState, useEffect } from 'react';

interface HistoryEntry {
  id: number;
  title: string;
  original_text: string;
  casual_katakana: string;
  formal_katakana: string;
  language: string;
  created_at: string;
}

const languages = [
  { code: '', name: '全ての言語' },
  { code: 'en', name: '英語' },
  { code: 'ko', name: '韓国語' },
  { code: 'fr', name: 'フランス語' },
  { code: 'de', name: 'ドイツ語' },
  { code: 'es', name: 'スペイン語' },
];

export default function ConversionSearch() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [results, setResults] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayMode, setDisplayMode] = useState<'standard' | 'ruby'>('standard');
  const [rubyStyle, setRubyStyle] = useState<'casual' | 'formal'>('casual');

  useEffect(() => {
    loadRecentConversions();
  }, []);

  const loadRecentConversions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/history/recent?limit=10');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Failed to load recent conversions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      await loadRecentConversions();
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        ...(language && { language }),
        limit: '20'
      });

      const response = await fetch(`http://localhost:8000/api/history/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  const createRubyDisplay = (originalText: string, casualKatakana: string, formalKatakana: string) => {
    // 改行で行分割
    const lines = originalText.split('\n');
    const casualLines = casualKatakana.split('\n');
    const formalLines = formalKatakana.split('\n');
    
    return lines.map((line, index) => {
      const katakana = rubyStyle === 'casual' 
        ? (casualLines[index] || line)
        : (formalLines[index] || line);
      
      return (
        <div key={index} className="block mb-2">
          <ruby className="inline-block">
            <span className="text-gray-900 font-medium text-sm">
              {line.trim()}
            </span>
            <rt className={`text-xs font-normal ${
              rubyStyle === 'casual' ? 'text-blue-600' : 'text-green-600'
            }`}>
              {katakana.trim()}
            </rt>
          </ruby>
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          🔍 {hasSearched ? '検索結果' : 'みんなの変換履歴'}
        </h2>
        
        {/* 表示モード選択 */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayMode('standard')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                displayMode === 'standard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📄 通常表示
            </button>
            <button
              onClick={() => setDisplayMode('ruby')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                displayMode === 'ruby'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📖 ルビ表示
            </button>
          </div>

          {displayMode === 'ruby' && (
            <div className="flex gap-2">
              <button
                onClick={() => setRubyStyle('casual')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  rubyStyle === 'casual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                🗣️ カジュアル
              </button>
              <button
                onClick={() => setRubyStyle('formal')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  rubyStyle === 'formal'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600 hover:bg-green-50 border border-green-200'
                }`}
              >
                🎯 フォーマル
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="タイトル、テキスト、カタカナで検索..."
              disabled={isLoading}
            />
          </div>
          <div className="md:w-48">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              disabled={isLoading}
            >
              {languages.map((lang) => (
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
              loadRecentConversions();
              setHasSearched(false);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            検索をクリア
          </button>
        )}
      </form>

      {/* 結果表示 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          読み込み中...
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {hasSearched ? '検索結果が見つかりませんでした' : 'まだ変換履歴がありません'}
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {results.map((entry) => (
            <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {getLanguageName(entry.language)}
                  </span>
                  <span className="text-xs">{formatDate(entry.created_at)}</span>
                </div>
              </div>
              
              {displayMode === 'ruby' ? (
                <div className="mb-3">
                  <p className={`text-sm font-medium mb-2 ${
                    rubyStyle === 'casual' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {rubyStyle === 'casual' ? '🗣️ カジュアル読み:' : '🎯 フォーマル読み:'}
                  </p>
                  <div className="text-sm leading-relaxed bg-gray-50 p-3 rounded">
                    {createRubyDisplay(entry.original_text, entry.casual_katakana, entry.formal_katakana)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">原文:</p>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm">{entry.original_text}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">🗣️ カジュアル:</p>
                      <p className="text-blue-900 bg-blue-50 p-2 rounded text-sm whitespace-pre-wrap">
                        {entry.casual_katakana}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium mb-1">🎯 フォーマル:</p>
                      <p className="text-green-900 bg-green-50 p-2 rounded text-sm whitespace-pre-wrap">
                        {entry.formal_katakana}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}