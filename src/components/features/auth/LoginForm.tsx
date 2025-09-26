'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onBack?: () => void;
}

export default function LoginForm({ onSwitchToRegister, onBack }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const { resendVerificationEmail } = useApiService();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResendMessage('');

    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      await login(username.trim(), password);
    } catch (err) {
      // エラーは AuthContext で処理済み
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      // ユーザー名からメールアドレスを取得する必要があるため、
      // エラーメッセージからメールアドレスを推測するか、
      // またはユーザー名をメールアドレスとして扱う
      const emailToUse = username.includes('@') ? username : `${username}@example.com`;

      await resendVerificationEmail(emailToUse);
      setResendMessage('確認メールを再送信しました。メールをご確認ください。');
    } catch (err) {
      setResendMessage('メール送信に失敗しました。しばらく経ってから再度お試しください。');
    } finally {
      setIsResending(false);
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">ログイン</h2>
            <p className="text-gray-600">アカウントにサインインしてください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                autoComplete="username"
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
                autoComplete="current-password"
                suppressHydrationWarning
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
                {(error.includes('メールアドレスが確認されていません') || error.includes('Email not verified')) && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline focus:outline-none"
                  >
                    {isResending ? '送信中...' : '確認メールを再送信'}
                  </button>
                )}
              </div>
            )}

            {resendMessage && (
              <div className={`p-4 rounded-xl ${resendMessage.includes('失敗') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <p className={`text-sm ${resendMessage.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>
                  {resendMessage}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
              suppressHydrationWarning
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {onSwitchToRegister && (
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-3">アカウントをお持ちでない方</p>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-pink-600 hover:text-pink-700 font-medium text-sm border-b border-pink-300 hover:border-pink-500 transition-colors"
                disabled={isLoading}
              >
                新規登録はこちら
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}