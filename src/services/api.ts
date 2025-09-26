import { useApi } from '../hooks/useApi';

// 認証不要のAPIを呼び出すための関数
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

async function publicApiCall<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const requestConfig: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body && method !== 'GET') {
    requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}${endpoint}`, requestConfig);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API エラー: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return response as T;
}

// API呼び出し用の型定義
export interface ConvertRequest {
  text: string;
  title: string;
  language: string;
}

export interface ConvertResponse {
  id: number;
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
  username?: string;
  is_favorite?: boolean;
}

// APIサービス用カスタムフック
export function useApiService() {
  const { apiCall } = useApi();

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

  // お気に入り関連のAPI
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

  // 認証不要のエンドポイント
  const verifyEmail = async (token: string): Promise<{ message: string }> => {
    return publicApiCall<{ message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
  };

  const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
    return publicApiCall<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: { email },
    });
  };

  const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    return publicApiCall<{ message: string }>('/api/auth/request-password-reset', {
      method: 'POST',
      body: { email },
    });
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
    return publicApiCall<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: { token, new_password: newPassword },
    });
  };

  // プロフィール関連のAPI
  interface ProfileResponse {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    is_email_verified: boolean;
    is_premium: boolean;
    created_at: string;
  }

  const getProfile = async (): Promise<ProfileResponse> => {
    return apiCall('/api/profile/me');
  };

  const updateUsername = async (newUsername: string): Promise<{ message: string; username: string }> => {
    return apiCall<{ message: string; username: string }>('/api/profile/username', {
      method: 'PUT',
      body: { new_username: newUsername },
    });
  };

  const updateEmail = async (newEmail: string, password: string): Promise<{ message: string; email: string }> => {
    return apiCall<{ message: string; email: string }>('/api/profile/email', {
      method: 'PUT',
      body: { new_email: newEmail, password },
    });
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>('/api/profile/password', {
      method: 'PUT',
      body: { current_password: currentPassword, new_password: newPassword },
    });
  };

  interface UsageStats {
      this_month: number;
    last_month: number;
  }

  const getUsageStats = async (): Promise<UsageStats> => {
    return apiCall('/api/profile/usage/stats');
  };


  return {
    convertText,
    getMyHistory,
    searchHistory,
    getRecentHistory,
    deleteHistory,
    addToFavorites,
    removeFromFavorites,
    getMyFavorites,
    checkFavoriteStatus,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    getProfile,
    updateUsername,
    updateEmail,
    updatePassword,
    getUsageStats,
    getConversionStatus,
  };
}