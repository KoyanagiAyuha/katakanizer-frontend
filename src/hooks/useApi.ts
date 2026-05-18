import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../utils/config';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

export function useApi() {
  const { getValidToken } = useAuth();

  const apiCall = useCallback(async <T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { method = 'GET', headers = {}, body, signal } = options;
    
    // 有効なトークンを取得
    const token = await getValidToken();
    if (!token) {
      throw new Error('認証が必要です');
    }

    // デフォルトヘッダーを設定
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers,
    };

    // リクエスト設定
    const requestConfig: RequestInit = {
      method,
      headers: defaultHeaders,
      signal,
    };

    // ボディがある場合は追加
    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // API呼び出し
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('認証エラー: ログインし直してください');
      } else if (response.status === 403) {
        throw new Error('権限がありません');
      } else if (response.status >= 500) {
        throw new Error('サーバーエラーが発生しました');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API エラー: ${response.status}`);
      }
    }

    // レスポンスがJSONの場合はパース、そうでなければそのまま返す
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response as T;
  }, [getValidToken]);

  return { apiCall };
}