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
              {conversionStatus && !conversionStatus.is_premium && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {conversionStatus.daily_limit - conversionStatus.remaining_conversions}/{conversionStatus.daily_limit}
                  </div>
                  <div className="text-sm text-gray-600">今日の変換</div>
                </div>
              )}
              {conversionStatus && conversionStatus.is_premium && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">∞</div>
                  <div className="text-sm text-gray-600">無制限</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{stats.favoriteLanguages.length}</div>
                <div className="text-sm text-gray-600">使用言語</div>
              </div>
            </div>

            {/* 変換制限の詳細表示 */}
            {conversionStatus && !conversionStatus.is_premium && (
              <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  本日の残り変換回数: <span className="font-semibold text-indigo-600">{conversionStatus.remaining_conversions}回</span>
                  {conversionStatus.remaining_conversions === 0 && (
                    <span className="ml-2 text-gray-500">(明日リセットされます)</span>
                  )}
                </p>
              </div>
            )}

            {/* プレミアムステータス */}
            {conversionStatus && conversionStatus.is_premium && (
              <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <p className="text-xs font-medium text-purple-900">プレミアムプラン - 無制限に変換できます</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}