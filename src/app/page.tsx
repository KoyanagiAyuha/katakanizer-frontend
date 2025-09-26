'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/features/auth/LoginForm';
import RegisterForm from '../components/features/auth/RegisterForm';
import MainApp from '../components/layout/MainApp';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (user) {
    return <MainApp />;
  }

  if (showAuth === 'login') {
    return <LoginForm onSwitchToRegister={() => setShowAuth('register')} onBack={() => setShowAuth(null)} />;
  }

  if (showAuth === 'register') {
    return <RegisterForm onSwitchToLogin={() => setShowAuth('login')} onBack={() => setShowAuth(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="pt-8 pb-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Katakanizer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            英語を自然なカタカナ音に変換する、次世代の発音学習アプリ
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a1 1 0 01-1 1M7 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1m-6 0V2a1 1 0 011-1h4a1 1 0 011 1v2m-6 0V1a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">AIパワード変換</h3>
                  <p className="text-gray-600">GPT-5の最新技術で、ネイティブ発音に近いカタカナ変換を実現</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">カジュアル & フォーマル</h3>
                  <p className="text-gray-600">日常会話用と正確な発音用、2つのスタイルで表現</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">学習履歴</h3>
                  <p className="text-gray-600">過去の変換履歴を保存して、効率的に復習</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                無料で始める
              </button>
              <button
                onClick={() => router.push('/login')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                ログイン
              </button>
            </div>
          </div>

          {/* Right Side - Demo */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20"></div>
              <div className="relative">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">変換例</h4>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">入力</div>
                    <div className="text-gray-800 font-medium">&ldquo;I called you yesterday&rdquo;</div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="text-sm text-pink-600 font-medium mb-1">カジュアル</div>
                      <div className="text-pink-800 text-lg">アイコールジュイェスタディ</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600 font-medium mb-1">フォーマル</div>
                      <div className="text-purple-800 text-lg">アイ コールド ユー イェスターデイ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">多言語対応</h3>
            <p className="text-gray-600">英語、韓国語、フランス語など9言語をサポート</p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">シンプル操作</h3>
            <p className="text-gray-600">直感的なUIで、誰でも簡単に使える</p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">高精度変換</h3>
            <p className="text-gray-600">最新のAI技術で自然な発音変換を実現</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;