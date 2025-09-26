// User types
export interface User {
  id: number;
  username: string;
  email: string;
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
  result: ConversionResult;
}

// Statistics types
export interface LanguageStats {
  language: string;
  count: number;
}

export interface UserStats {
  totalConversions: number;
  favoriteLanguages: LanguageStats[];
  thisMonthCount: number;
}

// API types
export interface ConvertRequest {
  text: string;
  title: string;
  language: string;
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