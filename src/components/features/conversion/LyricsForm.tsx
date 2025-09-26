'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LyricsEntry {
  id: number;
  title: string;
  original_text: string;
  casual_katakana: string;
  formal_katakana: string;
  language: string;
  created_at: string;
}

interface LyricsFormProps {
  onCreated?: (entry: LyricsEntry) => void;
}

const languages = [
  { code: 'en', name: '英語' },
  { code: 'ko', name: '韓国語' },
  { code: 'fr', name: 'フランス語' },
  { code: 'de', name: 'ドイツ語' },
  { code: 'es', name: 'スペイン語' },
];

export default function LyricsForm({ onCreated }: LyricsFormProps) {
  const { getValidToken } = useAuth();
  const [title, setTitle] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!title.trim() || !originalText.trim()) {
      setError('タイトルと歌詞の内容を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) {
        setError('ログインが必要です');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          original_text: originalText.trim(),
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '歌詞の保存に失敗しました');
      }

      const data: LyricsEntry = await response.json();
      
      setTitle('');
      setOriginalText('');
      setSuccess(true);
      onCreated?.(data);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">新しい歌詞を追加</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="楽曲名を入力"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              言語
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="originalText" className="block text-sm font-medium text-gray-700 mb-2">
            歌詞の内容
          </label>
          <textarea
            id="originalText"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={6}
            placeholder="歌詞の一部またはフレーズを入力"
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">歌詞が正常に保存されました！</p>
          </div>
        )}

        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-md">
          <p className="font-medium mb-1">ご利用について:</p>
          <p>保存すると、カジュアルとフォーマル両方の読み方が自動で生成されます。生成には少し時間がかかる場合があります。</p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !title.trim() || !originalText.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          {isLoading ? '保存中...' : '歌詞を保存'}
        </button>
      </form>
    </div>
  );
}