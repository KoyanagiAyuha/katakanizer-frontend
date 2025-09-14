import { useApi } from '../hooks/useApi';

// API呼び出し用の型定義
export interface ConvertRequest {
  text: string;
  title: string;
  language: string;
}

export interface ConvertResponse {
  title: string;
  word_mappings: Array<{
    line: string;
    casual: string;
    formal: string;
  }>;
}

export interface HistoryItem {
  id: number;
  title: string;
  original_text: string;
  word_mappings: Array<{
    line: string;
    casual: string;
    formal: string;
  }>;
  language: string;
  created_at: string;
}

// APIサービス用カスタムフック
export function useApiService() {
  const { apiCall } = useApi();

  const convertText = async (request: ConvertRequest): Promise<ConvertResponse> => {
    return apiCall<ConvertResponse>('/api/convert', {
      method: 'POST',
      body: request,
    });
  };

  const getMyHistory = async (): Promise<HistoryItem[]> => {
    return apiCall<HistoryItem[]>('/api/history/my');
  };

  const searchHistory = async (query: string, language?: string, offset: number = 0): Promise<HistoryItem[]> => {
    const params = new URLSearchParams({ query, offset: offset.toString() });
    if (language) params.append('language', language);
    
    return apiCall<HistoryItem[]>(`/api/history/search?${params.toString()}`);
  };

  const getRecentHistory = async (limit: number = 10, offset: number = 0): Promise<HistoryItem[]> => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    return apiCall<HistoryItem[]>(`/api/history/recent?${params.toString()}`);
  };

  const deleteHistory = async (historyId: number): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/api/history/${historyId}`, {
      method: 'DELETE',
    });
  };

  return {
    convertText,
    getMyHistory,
    searchHistory,
    getRecentHistory,
    deleteHistory,
  };
}