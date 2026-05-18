export interface LanguageOption {
  code: string;
  name: string;
}

export interface LanguageOptionWithExamples extends LanguageOption {
  examples: string[];
}

/** 言語コード → 日本語ラベル（絵文字付き） */
export const LANGUAGE_LABELS: Record<string, string> = {
  en: '🇺🇸 英語',
  ko: '🇰🇷 韓国語',
  fr: '🇫🇷 フランス語',
  es: '🇪🇸 スペイン語',
  de: '🇩🇪 ドイツ語',
  it: '🇮🇹 イタリア語',
  pt: '🇵🇹 ポルトガル語',
  zh: '🇨🇳 中国語',
};


/** 変換フォーム用の言語リスト（例文付き） */
export const LANGUAGES_WITH_EXAMPLES: LanguageOptionWithExamples[] = [
  { code: 'en', name: '英語', examples: ['hello', 'an apple', 'good morning', 'thank you', 'computer'] },
  { code: 'ko', name: '韓国語', examples: ['안녕하세요', '사랑해요', '감사합니다'] },
  { code: 'fr', name: 'フランス語', examples: ['bonjour', 'merci', 'au revoir'] },
  { code: 'de', name: 'ドイツ語', examples: ['hallo', 'danke', 'auf wiedersehen'] },
  { code: 'es', name: 'スペイン語', examples: ['hola', 'gracias', 'adiós'] },
];

/** 検索・フィルター用の言語リスト（「全ての言語」を含む） */
export const LANGUAGE_FILTER_OPTIONS: LanguageOption[] = [
  { code: '', name: '全ての言語' },
  { code: 'en', name: '英語' },
  { code: 'ko', name: '韓国語' },
  { code: 'fr', name: 'フランス語' },
  { code: 'es', name: 'スペイン語' },
  { code: 'de', name: 'ドイツ語' },
  { code: 'it', name: 'イタリア語' },
  { code: 'pt', name: 'ポルトガル語' },
  { code: 'zh', name: '中国語' },
];

/** フォーム用の言語リスト（例文なし、5言語） */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: '英語' },
  { code: 'ko', name: '韓国語' },
  { code: 'fr', name: 'フランス語' },
  { code: 'de', name: 'ドイツ語' },
  { code: 'es', name: 'スペイン語' },
];

/** Google AdSense パブリッシャーID */
export const ADSENSE_CLIENT_ID = 'ca-pub-2107585083110270';
