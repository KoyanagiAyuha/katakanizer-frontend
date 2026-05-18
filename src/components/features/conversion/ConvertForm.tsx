'use client';

import { useState } from 'react';
import { Button, FormInput, FormTextarea, FormSelect, InfoMessage } from '../../ui';
import { LANGUAGES_WITH_EXAMPLES } from '../../../utils/constants';

interface ConvertFormProps {
  onConvert: (title: string, text: string, language: string) => void;
  isLoading: boolean;
}


export default function ConvertForm({ onConvert, isLoading }: ConvertFormProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');

  const selectedLanguage = LANGUAGES_WITH_EXAMPLES.find(lang => lang.code === language) || LANGUAGES_WITH_EXAMPLES[0];

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
          {LANGUAGES_WITH_EXAMPLES.map((lang) => (
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