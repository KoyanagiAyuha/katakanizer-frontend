'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, FormInput, ErrorMessage, SuccessMessage, Card, PageHeader } from '../../ui';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onBack?: () => void;
}

export default function LoginForm({ onSwitchToRegister, onBack }: LoginFormProps) {
  const router = useRouter();
  const { login, resendVerificationEmail, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResendMessage('');

    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err instanceof Error && err.message === 'メールアドレスが確認されていません') {
        router.push(`/registration-success?email=${encodeURIComponent(email.trim())}`);
      }
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      await resendVerificationEmail();
      setResendMessage('確認メールを再送信しました。メールをご確認ください。');
    } catch {
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

        <Card className="shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <PageHeader
              title="Katakanizer"
              subtitle="ログイン"
              description="アカウントにサインインしてください"
              size="md"
              className="mb-0"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              disabled={isLoading}
              required
              autoComplete="email"
              variant="rounded"
              inputSize="lg"
              suppressHydrationWarning
            />

            <FormInput
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              disabled={isLoading}
              required
              autoComplete="current-password"
              variant="rounded"
              inputSize="lg"
              suppressHydrationWarning
            />

            {error && (
              <ErrorMessage>
                <p>{error}</p>
                {(error.includes('メールアドレスが確認されていません') || error.includes('Email not verified')) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleResendVerification}
                    isLoading={isResending}
                    loadingText="送信中..."
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline bg-transparent border-none p-0 hover:bg-transparent"
                  >
                    確認メールを再送信
                  </Button>
                )}
              </ErrorMessage>
            )}

            {resendMessage && (
              resendMessage.includes('失敗') ? (
                <ErrorMessage>
                  {resendMessage}
                </ErrorMessage>
              ) : (
                <SuccessMessage>
                  {resendMessage}
                </SuccessMessage>
              )
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!email.trim() || !password.trim()}
              isLoading={isLoading}
              loadingText="ログイン中..."
              suppressHydrationWarning
            >
              ログイン
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-pink-600 hover:text-pink-700 hover:underline"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          </form>

          {onSwitchToRegister && (
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-3">アカウントをお持ちでない方</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={onSwitchToRegister}
                disabled={isLoading}
                className="text-pink-600 hover:text-pink-700 font-medium border-b border-pink-300 hover:border-pink-500 bg-transparent border-0 border-b-2 rounded-none hover:bg-transparent"
              >
                新規登録はこちら
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
