'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { ButtonLoadingSpinner } from '../../ui/LoadingSpinner';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onBack?: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onBack }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    setFormError(null);
    
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError('すべての項目を入力してください');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('パスワードが一致しません');
      return false;
    }

    if (password.length < 8) {
      setFormError('パスワードは8文字以上で入力してください');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(username.trim(), email.trim(), password);
      // 登録成功したら登録成功ページへリダイレクト（メールアドレスをパラメータとして渡す）
      if (result) {
        router.push(`/registration-success?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err) {
      // エラーは AuthContext で処理済み
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Katakanizer
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">新規登録</h2>
            <p className="text-gray-600">アカウントを作成してください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-800 placeholder-gray-400"
                placeholder="ユーザー名"
                disabled={isLoading}
                required
                suppressHydrationWarning
              />
              <p className="text-xs text-gray-500 mt-1">3-30文字、英数字とアンダースコア</p>
            </div>

            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-800 placeholder-gray-400"
                placeholder="メールアドレス"
                disabled={isLoading}
                required
                suppressHydrationWarning
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-800 placeholder-gray-400"
                placeholder="パスワード"
                disabled={isLoading}
                required
                suppressHydrationWarning
              />
            </div>

            <div>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-800 placeholder-gray-400"
                placeholder="パスワード確認"
                disabled={isLoading}
                required
              />
            </div>

            {(error || formError) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error || formError}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 bg-pink-50 p-4 rounded-xl border border-pink-100">
              <p className="font-medium text-pink-700 mb-2">パスワード要件:</p>
              <ul className="space-y-1 text-pink-600">
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  最低8文字
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  大文字・小文字を含む
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  数字を含む
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  特殊文字を含む
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !email.trim() || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <ButtonLoadingSpinner />
                  <span className="ml-2">登録中...</span>
                </div>
              ) : (
                '無料で始める'
              )}
            </button>
          </form>

          {onSwitchToLogin && (
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-3">すでにアカウントをお持ちの方</p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-pink-600 hover:text-pink-700 font-medium text-sm border-b border-pink-300 hover:border-pink-500 transition-colors"
                disabled={isLoading}
              >
                ログインはこちら
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}