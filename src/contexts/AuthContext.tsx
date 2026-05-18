'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/types';
import { API_BASE_URL } from '@/utils/config';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserInfo: (updates: Partial<User>) => void;
  updateEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser && fbUser.emailVerified) {
        await fetchCurrentUser(fbUser);
      } else {
        setUser(null);
      }

      setIsInitialized(true);
    });

    return () => unsubscribe();
    // 認証リスナーはマウント時に一度だけ登録する（fetchCurrentUser は意図的に依存配列へ含めない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // バックエンドにユーザーを登録する。成功可否を返す。
  const signupBackend = async (fbUser: FirebaseUser, username: string): Promise<boolean> => {
    try {
      const idToken = await fbUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ username }),
      });
      return response.ok;
    } catch (err) {
      console.warn('Backend signup error:', err);
      return false;
    }
  };

  const fetchCurrentUser = async (fbUser: FirebaseUser) => {
    try {
      const idToken = await fbUser.getIdToken();
      const fetchMe = () =>
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

      let response = await fetchMe();

      // バックエンド未登録（register 時の signup 失敗）の場合、
      // メール検証済みであれば signup をリトライしてから再取得する
      if (response.status === 404 && fbUser.emailVerified) {
        const username =
          fbUser.displayName || fbUser.email?.split('@')[0] || 'user';
        const created = await signupBackend(fbUser, username);
        if (created) {
          response = await fetchMe();
        }
      }

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        if (response.status !== 403 && response.status !== 404) {
          console.warn(`Backend authentication failed: ${response.status}`);
        }
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        // メール未検証の場合、検証メールを再送信してエラーを投げる
        // サインイン状態は維持（再送信ページで sendEmailVerification を使うため）
        try {
          await sendEmailVerification(userCredential.user);
        } catch {
          // レート制限等で再送信に失敗しても、リダイレクトは行う
        }
        const errorMessage = 'メールアドレスが確認されていません';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      await fetchCurrentUser(userCredential.user);
    } catch (err) {
      if (err instanceof Error && err.message === 'メールアドレスが確認されていません') {
        throw err;
      }
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // ユーザー名を Firebase プロフィールに保存
      // （バックエンド登録が失敗した場合のリトライで username を再利用するため）
      await updateProfile(userCredential.user, { displayName: username });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // バックエンドにユーザー登録（失敗しても Firebase 登録自体は成功扱い）。
      // ここで失敗しても、メール検証後の初回ログイン時に fetchCurrentUser が
      // signup を自動リトライするため、登録漏れにはならない。
      const created = await signupBackend(userCredential.user, username);
      if (!created) {
        console.warn('Backend signup failed, will retry on first verified login');
      }

      // 未検証でもサインイン状態を維持（再送信のため firebaseUser が必要）
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!firebaseUser) {
      throw new Error('ログインが必要です');
    }

    try {
      await sendEmailVerification(firebaseUser);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getValidToken = async (): Promise<string | null> => {
    if (!isInitialized) {
      return new Promise((resolve) => {
        const checkInit = setInterval(() => {
          if (isInitialized) {
            clearInterval(checkInit);
            resolve(getValidToken());
          }
        }, 100);
      });
    }

    if (!firebaseUser) return null;

    try {
      // Firebase automatically handles token refresh
      return await firebaseUser.getIdToken();
    } catch (err) {
      console.error('Failed to get token:', err);
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateUserInfo = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const reauthenticate = async (currentPassword: string) => {
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('ログインが必要です');
    }
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
  };

  const updateEmail = async (currentPassword: string, newEmail: string) => {
    if (!firebaseUser) {
      throw new Error('ログインが必要です');
    }

    try {
      // 再認証
      await reauthenticate(currentPassword);
      // メールアドレス変更前に確認メールを送信
      await verifyBeforeUpdateEmail(firebaseUser, newEmail);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      throw new Error(errorMessage);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser) {
      throw new Error('ログインが必要です');
    }

    try {
      // 再認証
      await reauthenticate(currentPassword);
      // パスワード変更
      await firebaseUpdatePassword(firebaseUser, newPassword);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    firebaseUser,
    login,
    register,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateUserInfo,
    updateEmail,
    updatePassword,
    isLoading,
    loading: !isInitialized,
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

function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const errorCode = (error as { code?: string }).code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません';
      case 'auth/operation-not-allowed':
        return 'この操作は許可されていません';
      case 'auth/weak-password':
        return 'パスワードが弱すぎます（6文字以上必要）';
      case 'auth/user-disabled':
        return 'このアカウントは無効化されています';
      case 'auth/user-not-found':
        return 'ユーザーが見つかりません';
      case 'auth/wrong-password':
        return 'パスワードが間違っています';
      case 'auth/invalid-credential':
        return 'メールアドレスまたはパスワードが間違っています';
      case 'auth/too-many-requests':
        return 'リクエストが多すぎます。しばらく待ってから再試行してください';
      case 'auth/network-request-failed':
        return 'ネットワークエラーが発生しました';
      default:
        return error.message || '不明なエラーが発生しました';
    }
  }
  return '不明なエラーが発生しました';
}
