'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApiService } from '../../services/api';

function RegistrationSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resendVerificationEmail } = useApiService();

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleResendVerification = async () => {
    if (!email && showEmailInput) {
      setResendMessage('メールアドレスを入力してください。');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const emailToUse = email || searchParams.get('email') || '';

      if (!emailToUse) {
        setShowEmailInput(true);
        setResendMessage('メールアドレスを入力してください。');
        setIsResending(false);
        return;
      }

      await resendVerificationEmail(emailToUse);
      setResendMessage('確認メールを再送信しました。メールをご確認ください。');
      setShowEmailInput(false);
    } catch (err) {
      setResendMessage('メール送信に失敗しました。しばらく経ってから再度お試しください。');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              登録完了！
            </h2>

            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                ご登録ありがとうございます。
              </p>
              <p className="text-gray-600">
                確認メールをお送りしました。
              </p>
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <p className="text-pink-700 font-medium text-sm">
                  メール内のリンクをクリックして、メールアドレスの確認を完了してください。
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                <p>メールが届かない場合は：</p>
                <ul className="mt-2 space-y-1 text-left">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span>迷惑メールフォルダをご確認ください</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span>登録したメールアドレスが正しいか確認してください</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span>数分待ってもメールが届かない場合は、再送信をお試しください</span>
                  </li>
                </ul>
              </div>

              {showEmailInput && (
                <div className="mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="メールアドレスを入力"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-800"
                    disabled={isResending}
                  />
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
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isResending ? '送信中...' : '確認メールを再送信'}
              </button>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ログインページへ
              </button>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-gray-300"
              >
                トップページへ戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationSuccessPageContent />
    </Suspense>
  );
}
