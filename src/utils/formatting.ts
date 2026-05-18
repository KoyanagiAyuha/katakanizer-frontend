import { HistoryItem as ApiHistoryItem } from '../services/api';
import { ConversionHistoryItem } from '../types';
import { LANGUAGE_LABELS } from './constants';

/** 言語コードからラベルを取得する */
export function getLanguageLabel(language: string): string {
  return LANGUAGE_LABELS[language] || language;
}

/** API のレスポンスをフロントエンド用の型に変換する */
export function formatApiHistory(item: ApiHistoryItem): ConversionHistoryItem {
  return {
    id: item.id,
    timestamp: formatDateJP(item.created_at),
    text: item.original_text,
    title: item.title,
    language: item.language,
    is_favorite: item.is_favorite || false,
    username: item.username,
    result: {
      title: item.title,
      word_mappings: item.word_mappings,
    },
  };
}

/** 日付文字列を日本語のロケール文字列に変換する */
export function formatDateJP(dateString: string): string {
  return new Date(dateString).toLocaleString('ja-JP');
}

/** 日付文字列を日本語の短い日付形式に変換する */
export function formatDateShortJP(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
