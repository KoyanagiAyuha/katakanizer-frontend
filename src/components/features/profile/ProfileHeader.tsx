'use client';

import React from 'react';

interface ProfileHeaderProps {
  user: any;
  stats: {
    totalConversions: number;
    favoriteLanguages: any[];
    thisMonthCount: number;
  };
}

export default function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* アバター */}
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {user?.username?.charAt(0)?.toUpperCase()}
            </span>
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user?.username}</h1>
            <p className="text-gray-600 mb-4">{user?.email}</p>

            {/* 統計情報 */}
            <div className="flex justify-center md:justify-start space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalConversions}</div>
                <div className="text-sm text-gray-600">総変換数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.thisMonthCount}</div>
                <div className="text-sm text-gray-600">今月の変換</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{stats.favoriteLanguages.length}</div>
                <div className="text-sm text-gray-600">使用言語</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}