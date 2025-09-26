'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  loading: boolean; // 初期化状態のローディング
  error: string | null;
  clearError: () => void;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedRefreshToken = localStorage.getItem('refresh_token');
      const savedExpiry = localStorage.getItem('token_expiry');
      
      if (savedToken && savedRefreshToken && savedExpiry) {
        const expiry = parseInt(savedExpiry);
        const now = Date.now();
        const bufferTime = 60000; // 1分のバッファ
        
        setRefreshToken(savedRefreshToken);
        
        // トークンの有効期限をチェック（バッファ時間を考慮）
        if (expiry - bufferTime > now) {
          // トークンがまだ有効
          setToken(savedToken);
          setTokenExpiry(expiry);
          await fetchCurrentUser(savedToken);
        } else {
          // トークンが期限切れまたは期限が近い場合はリフレッシュ
          await refreshAccessToken(savedRefreshToken);
        }
      } else {
        // 保存されたトークンがない場合はクリア
        clearAuthData();
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // 401エラーの場合は認証が無効なので、初期化後でなければクリア
        if (isInitialized) {
          console.warn('Authentication failed, clearing auth data');
          clearAuthData();
        }
      } else {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      if (isInitialized) {
        clearAuthData();
      }
    }
  };

  const refreshAccessToken = async (refreshTokenValue: string): Promise<string | null> => {
    if (isRefreshing) {
      // すでにリフレッシュ中の場合は待機
      return new Promise((resolve) => {
        const checkRefresh = setInterval(() => {
          if (!isRefreshing) {
            clearInterval(checkRefresh);
            resolve(token);
          }
        }, 100);
      });
    }

    setIsRefreshing(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;
        const expiresIn = data.expires_in || 7200; // デフォルト2時間（.envの設定に合わせる）
        const newExpiry = Date.now() + (expiresIn * 1000);
        
        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setTokenExpiry(newExpiry);
        
        localStorage.setItem('auth_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        localStorage.setItem('token_expiry', newExpiry.toString());
        
        // ユーザー情報も取得
        await fetchCurrentUser(newAccessToken);
        
        return newAccessToken;
      } else {
        console.warn('Token refresh failed, clearing auth data');
        clearAuthData();
        return null;
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      clearAuthData();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'ログインに失敗しました');
      }

      const data = await response.json();
      const authToken = data.access_token;
      const refreshTokenValue = data.refresh_token;
      const expiresIn = data.expires_in || 7200; // デフォルト2時間（.envの設定に合わせる）
      const expiry = Date.now() + (expiresIn * 1000);
      
      setToken(authToken);
      setRefreshToken(refreshTokenValue);
      setTokenExpiry(expiry);
      
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('refresh_token', refreshTokenValue);
      localStorage.setItem('token_expiry', expiry.toString());
      
      await fetchCurrentUser(authToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'ユーザー登録に失敗しました');
      }

      const userData = await response.json();
      // 登録成功 - 自動ログインはしない
      return userData;
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // サーバー側でリフレッシュトークンを無効化
    if (token) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    
    clearAuthData();
    setError(null);
  };

  const getValidToken = async (): Promise<string | null> => {
    if (!isInitialized) {
      // まだ初期化されていない場合は待機
      return new Promise((resolve) => {
        const checkInit = setInterval(() => {
          if (isInitialized) {
            clearInterval(checkInit);
            resolve(getValidToken());
          }
        }, 100);
      });
    }

    if (!token || !tokenExpiry) return null;
    
    const now = Date.now();
    const bufferTime = 60000; // 1分のバッファ
    
    if (tokenExpiry - bufferTime > now) {
      // トークンはまだ有効
      return token;
    } else if (refreshToken) {
      // トークンをリフレッシュ
      return await refreshAccessToken(refreshToken);
    } else {
      clearAuthData();
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    loading: !isInitialized, // 初期化が完了していない間はローディング状態
    error,
    clearError,
    getValidToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}