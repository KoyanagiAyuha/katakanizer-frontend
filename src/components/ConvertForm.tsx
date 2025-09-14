'use client';

import { useState } from 'react';

interface ConvertFormProps {
  onConvert: (title: string, text: string, language: string) => void;
  isLoading: boolean;
}

interface LanguageOption {
  code: string;
  name: string;
  examples: string[];
}

const languages: LanguageOption[] = [
  { code: 'en', name: '英語', examples: ['hello', 'an apple', 'good morning', 'thank you', 'computer'] },
  { code: 'ko', name: '韓国語', examples: ['안녕하세요', '사랑해요', '감사합니다'] },
  { code: 'fr', name: 'フランス語', examples: ['bonjour', 'merci', 'au revoir'] },
  { code: 'de', name: 'ドイツ語', examples: ['hallo', 'danke', 'auf wiedersehen'] },
  { code: 'es', name: 'スペイン語', examples: ['hola', 'gracias', 'adiós'] },
];


export default function ConvertForm({ onConvert, isLoading }: ConvertFormProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');

  const selectedLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onConvert(title.trim() || '無題', text.trim(), language);
    }
  };

  const handleExampleClick = (example: string) => {
    setText(example);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* タイトルと言語選択 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-2">
            タイトル（任意）
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="例: 好きな曲名やフレーズ名"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-800 mb-2">
            言語
          </label>
          <select
            id="language"
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
      </div>

      {/* 変換スタイル説明 */}
      <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200">
        📝 両方のスタイルを自動生成します：カジュアル（自然な音）とフォーマル（正確な発音）
      </div>

      {/* テキスト入力 */}
      <div>
        <label 
          htmlFor="text-input" 
          className="block text-sm font-medium text-gray-800 mb-2"
        >
          {selectedLanguage.name}のテキストを入力してください
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`例: ${selectedLanguage.examples[0]}`}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500"
          rows={4}
          disabled={isLoading}
        />
      </div>

      {/* サンプル例 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-500">サンプル:</span>
        {selectedLanguage.examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-md hover:shadow-lg"
      >
        {isLoading ? '変換中...' : '🎌 カタカナに変換'}
      </button>
    </form>
  );
}