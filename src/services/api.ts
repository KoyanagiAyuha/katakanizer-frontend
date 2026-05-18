import { useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import type { ConvertRequest, ProfileResponse, WordMapping } from '../types';

export type { ConvertRequest, ProfileResponse };

export interface ConvertResponse {
  id: number;
  title: string;
  word_mappings: WordMapping[];
}

export interface HistoryItem {
  id: number;
  title: string;
  original_text: string;
  word_mappings: WordMapping[];
  language: string;
  created_at: string;
  username: string;
  is_favorite: boolean;
}

// APIサービス用カスタムフック
export function useApiService() {
  const { apiCall } = useApi();

  return useMemo(() => {

  const convertText = async (request: ConvertRequest, signal?: AbortSignal): Promise<ConvertResponse> => {
    return apiCall<ConvertResponse>('/api/convert', {
      method: 'POST',
      body: request,
      signal,
    });
  };

  const getConversionStatus = async (): Promise<{
    can_convert: boolean;
    remaining_conversions: number;
    daily_limit: number;
    is_premium: boolean;
    reset_time?: string;
  }> => {
    return apiCall('/api/convert/status');
  };

  const getMyHistory = async (limit: number = 20): Promise<HistoryItem[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    return apiCall<HistoryItem[]>(`/api/history/my?${params.toString()}`);
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

  // お気に入り関連のAPI
  const toggleFavorite = async (conversionId: number): Promise<{ message: string; is_favorite: boolean }> => {
    return apiCall<{ message: string; is_favorite: boolean }>(`/api/favorites/${conversionId}/toggle`, {
      method: 'POST',
    });
  };

  const addToFavorites = async (conversionId: number): Promise<{ message: string; is_favorite: boolean }> => {
    return apiCall<{ message: string; is_favorite: boolean }>(`/api/favorites/${conversionId}`, {
      method: 'POST',
    });
  };

  const removeFromFavorites = async (conversionId: number): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/api/favorites/${conversionId}`, {
      method: 'DELETE',
    });
  };

  const getMyFavorites = async (limit: number = 20, offset: number = 0): Promise<HistoryItem[]> => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    return apiCall<HistoryItem[]>(`/api/favorites/my?${params.toString()}`);
  };

  const checkFavoriteStatus = async (conversionId: number): Promise<{ is_favorite: boolean }> => {
    return apiCall<{ is_favorite: boolean }>(`/api/favorites/check/${conversionId}`);
  };

  // プロフィール関連のAPI
  const getProfile = async (): Promise<ProfileResponse> => {
    return apiCall('/api/profile/me');
  };

  const updateUsername = async (newUsername: string): Promise<{ message: string; username: string }> => {
    return apiCall<{ message: string; username: string }>('/api/profile/username', {
      method: 'PUT',
      body: { new_username: newUsername },
    });
  };

  const getUsageStats = async (): Promise<ProfileResponse> => {
    return apiCall('/api/profile/usage/stats');
  };

    return {
      convertText,
      getMyHistory,
      getRecentHistory,
      deleteHistory,
      toggleFavorite,
      addToFavorites,
      removeFromFavorites,
      getMyFavorites,
      checkFavoriteStatus,
      getProfile,
      updateUsername,
      getUsageStats,
      getConversionStatus,
    };
  }, [apiCall]);
}
