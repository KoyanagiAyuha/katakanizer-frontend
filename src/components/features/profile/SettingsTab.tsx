'use client';

import React from 'react';

interface SettingsTabProps {
  user: any;
  onLogout: () => void;
  stats: {
    totalConversions: number;
    favoriteLanguages: any[];
    thisMonthCount: number;
  };
}

export default function SettingsTab({ user, onLogout, stats }: SettingsTabProps) {
  const getLanguageLabel = (language: string) => {
    const labels: { [key: string]: string } = {
      'en': '🇺🇸 English',
      'ko': '🇰🇷 Korean',
      'fr': '🇫🇷 French',
      'es': '🇪🇸 Spanish',
      'de': '🇩🇪 German',
      'it': '🇮🇹 Italian',
      'pt': '🇵🇹 Portuguese',
      'zh': '🇨🇳 Chinese',
      'ja': '🇯🇵 Japanese'
    };
    return labels[language] || language;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">アカウント設定</h2>

      {/* アカウント情報 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
            <div className="text-gray-900">{user?.username}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <div className="text-gray-900">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* 利用統計 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">利用統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalConversions}</div>
            <div className="text-sm text-indigo-800">総変換数</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.thisMonthCount}</div>
            <div className="text-sm text-purple-800">今月の変換数</div>
          </div>
        </div>

        {stats.favoriteLanguages.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">よく使う言語</h4>
            <div className="space-y-2">
              {stats.favoriteLanguages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{getLanguageLabel(lang.language)}</span>
                  <span className="text-sm font-medium text-gray-900">{lang.count}回</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* アクション */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
        <div className="space-y-4">
          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}