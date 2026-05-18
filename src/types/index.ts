// User types (matches backend UserResponse)
export interface User {
  id: number;
  username: string;
  is_premium: boolean;
  created_at: string;
}

// Conversion types
export interface WordMapping {
  line: string;
  casual: string;
  formal: string;
}

export interface ConversionResult {
  title: string;
  word_mappings: WordMapping[];
}

export interface ConversionHistoryItem {
  id: number;
  timestamp: string;
  text: string;
  title: string;
  language: string;
  is_favorite: boolean;
  username?: string;
  result: ConversionResult;
}

// Statistics types
export interface LanguageStats {
  language: string;
  count: number;
}

export interface UserStats {
  favoriteLanguages: LanguageStats[];
  thisMonthCount: number;
}

// API types
export interface ConvertRequest {
  text: string;
  title: string;
  language: string;
}

// Profile types (matches backend UserProfileResponse)
export interface ProfileResponse {
  id: number;
  username: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  daily_usage: number;
  daily_limit: number;
  remaining_conversions: number;
  created_at: string;
}

// Modal types
export interface DeleteConfirmData {
  id: number;
  title: string;
}

// Tab types
export type TabType = 'history' | 'favorites' | 'profile';
export type DisplayMode = 'casual' | 'formal';

// Toast types
export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'loading';
  title: string;
  message: string;
  duration?: number;
}
