'use client';

import React from 'react';

interface ProfileHeaderProps {
  user: any;
  stats: {
    favoriteLanguages: any[];
  };
  conversionStatus: {
    can_convert: boolean;
    remaining_conversions: number;
    daily_limit: number;
    is_premium: boolean;
  } | null;
}

export default function ProfileHeader({ user, stats, conversionStatus }: ProfileHeaderProps) {
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
                <div className="text-2xl font-bold text-indigo-600">
                  {!conversionStatus ? (
                    <span className="inline-block animate-pulse bg-indigo-100 rounded w-12 h-7">&nbsp;</span>
                  ) : conversionStatus.is_premium ? (
                    '∞'
                  ) : (
                    `${conversionStatus.daily_limit - conversionStatus.remaining_conversions}/${conversionStatus.daily_limit}`
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {conversionStatus?.is_premium ? '無制限' : '今日の変換'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {stats.favoriteLanguages.length === 0 && !conversionStatus ? (
                    <span className="inline-block animate-pulse bg-pink-100 rounded w-8 h-7">&nbsp;</span>
                  ) : (
                    stats.favoriteLanguages.length
                  )}
                </div>
                <div className="text-sm text-gray-600">使用言語</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}