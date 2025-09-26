'use client';

import { useState } from 'react';
import { Button, FormInput, FormTextarea, FormSelect, InfoMessage, LanguageBadge } from '../../ui';

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
        <FormInput
          type="text"
          id="title"
          label="タイトル（任意）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 好きな曲名やフレーズ名"
          disabled={isLoading}
        />

        <FormSelect
          id="language"
          label="言語"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </FormSelect>
      </div>

      {/* 変換スタイル説明 */}
      <InfoMessage size="sm">
        📝 両方のスタイルを自動生成します：カジュアル（自然な音）とフォーマル（正確な発音）
      </InfoMessage>

      {/* テキスト入力 */}
      <FormTextarea
        id="text-input"
        label={`${selectedLanguage.name}のテキストを入力してください`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`例: ${selectedLanguage.examples[0]}`}
        rows={4}
        disabled={isLoading}
      />

      {/* サンプル例 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-500">サンプル:</span>
        {selectedLanguage.examples.map((example) => (
          <Button
            key={example}
            variant="secondary"
            size="sm"
            onClick={() => handleExampleClick(example)}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full border-none"
          >
            {example}
          </Button>
        ))}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!text.trim()}
        isLoading={isLoading}
        loadingText="変換中..."
      >
        🎌 カタカナに変換
      </Button>
    </form>
  );
}