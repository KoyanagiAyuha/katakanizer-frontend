'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApiService } from '../../../services/api';

interface ConversionStatus {
  can_convert: boolean;
  remaining_conversions: number;
  daily_limit: number;
  is_premium: boolean;
  reset_time?: string;
}

interface UsageLimitBannerProps {
  onUpgradeClick?: () => void;
}

export default function UsageLimitBanner({ onUpgradeClick }: UsageLimitBannerProps) {
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { getConversionStatus } = useApiService();

  const loadStatus = useCallback(async () => {
    try {
      const status = await getConversionStatus();
      setConversionStatus(status);
    } catch (error) {
      console.error('Failed to load conversion status:', error);
    } finally {
      setLoading(false);
    }
  }, [getConversionStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (loading || !conversionStatus) return null;

  const { remaining_conversions, daily_limit, is_premium, reset_time } = conversionStatus;

  // プレミアムユーザーには表示しない
  if (is_premium) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-purple-900 font-medium">プレミアムプラン</p>
              <p className="text-sm text-purple-700">無制限で変換をお楽しみください</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 残り回数によって表示を変更
  const percentageUsed = ((daily_limit - remaining_conversions) / daily_limit) * 100;
  const isLow = remaining_conversions <= 2;
  const isEmpty = remaining_conversions === 0;

  // リセット時刻の計算（reset_time が無い場合はカウントダウンを表示しない）
  const resetDate = reset_time ? new Date(reset_time) : null;
  const msUntilReset = resetDate ? resetDate.getTime() - Date.now() : 0;
  const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(msUntilReset / (1000 * 60)) % 60;

  return (
    <div className={`rounded-xl p-4 mb-6 border ${
      isEmpty
        ? 'bg-red-50 border-red-300'
        : isLow
        ? 'bg-orange-50 border-orange-300'
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isEmpty
                ? 'bg-red-500'
                : isLow
                ? 'bg-orange-500'
                : 'bg-blue-500'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className={`font-medium ${
                isEmpty
                  ? 'text-red-900'
                  : isLow
                  ? 'text-orange-900'
                  : 'text-blue-900'
              }`}>
                本日の残り変換回数: {remaining_conversions}/{daily_limit}
              </p>
              <p className={`text-sm ${
                isEmpty
                  ? 'text-red-700'
                  : isLow
                  ? 'text-orange-700'
                  : 'text-blue-700'
              }`}>
                {isEmpty
                  ? (resetDate
                    ? `次のリセットまで ${hoursUntilReset}時間 ${minutesUntilReset}分`
                    : '明日リセットされます')
                  : isLow
                  ? 'まもなく上限に達します'
                  : '無料プランをご利用中です'
                }
              </p>
            </div>
          </div>

          {/* アップグレードボタン */}
          {(isEmpty || isLow) && (
            <button
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all hover:shadow-lg"
            >
              プレミアムへ
            </button>
          )}
        </div>

        {/* プログレスバー */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isEmpty
                ? 'bg-red-500'
                : isLow
                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                : 'bg-gradient-to-r from-blue-400 to-blue-500'
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* 追加メッセージ */}
        {isEmpty && (
          <div className="bg-red-100 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>本日の変換回数制限に達しました。</strong>
              プレミアムプランにアップグレードすると、無制限に変換できます。
            </p>
          </div>
        )}

        {isLow && !isEmpty && (
          <div className="bg-orange-100 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              残り変換回数が少なくなっています。プレミアムプランで無制限に変換しませんか？
            </p>
          </div>
        )}
      </div>
    </div>
  );
}