'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';
import ProfileHeader from './ProfileHeader';
import TabNavigation from './TabNavigation';
import HistoryTab from './HistoryTab';
import FavoritesTab from './FavoritesTab';
import SettingsTab from './SettingsTab';
import DeleteConfirmModal from './DeleteConfirmModal';

interface ProfilePageProps {
  onHistoryClick?: (item: any) => void;
}

export default function ProfilePage({ onHistoryClick }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const { getMyHistory, deleteHistory, addToFavorites, getConversionStatus } = useApiService();
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'profile'>('history');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    favoriteLanguages: [] as { language: string; count: number }[],
    thisMonthCount: 0,
  });
  const [conversionStatus, setConversionStatus] = useState<{
    can_convert: boolean;
    remaining_conversions: number;
    daily_limit: number;
    is_premium: boolean;
  } | null>(null);

  // 自分の変換履歴を読み込み
  useEffect(() => {
    const loadMyHistory = async () => {
      setIsLoading(true);
      try {
        // まずlocalStorageから履歴を読み込み
        const savedHistory = localStorage.getItem('katakanizer_history');
        if (savedHistory) {
          const localHistory = JSON.parse(savedHistory);
          setMyHistory(localHistory);
          calculateStats(localHistory);
        }

        // APIから最新の履歴を取得
        try {
          const apiHistory = await getMyHistory();

          // API履歴をフロントエンド形式に変換
          const formattedHistory = apiHistory.map((item: any) => ({
            id: item.id,
            timestamp: new Date(item.created_at).toLocaleString('ja-JP'),
            text: item.original_text,
            title: item.title,
            language: item.language,
            is_favorite: item.is_favorite || false,
            result: {
              title: item.title,
              word_mappings: item.word_mappings
            }
          }));

          // 既存のローカル履歴とマージ（重複を避ける）
          const localHistory = savedHistory ? JSON.parse(savedHistory) : [];
          const mergedHistory = [...formattedHistory];

          // ローカル履歴でAPIに存在しないものを追加
          localHistory.forEach((localItem: any) => {
            const existsInApi = formattedHistory.some((apiItem: any) =>
              apiItem.text === localItem.text &&
              Math.abs(new Date(apiItem.timestamp).getTime() - new Date(localItem.timestamp).getTime()) < 60000
            );
            if (!existsInApi) {
              mergedHistory.push(localItem);
            }
          });

          // タイムスタンプでソート
          mergedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          setMyHistory(mergedHistory);
          calculateStats(mergedHistory);

          // localStorageを更新
          localStorage.setItem('katakanizer_history', JSON.stringify(mergedHistory));
        } catch (error) {
          console.error('Failed to load API history:', error);
          // エラーの場合はlocalStorageの履歴のみ使用
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadMyHistory();
    }
  }, [user]);

  // 変換ステータスを取得
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await getConversionStatus();
        setConversionStatus(status);
      } catch (error) {
        console.error('Failed to load conversion status:', error);
      }
    };

    if (user) {
      loadStatus();
    }
  }, [user, myHistory]); // 履歴が更新されるたびにステータスも更新

  const calculateStats = (history: any[]) => {
    // 言語別の使用回数を計算
    const languageCount: { [key: string]: number } = {};
    history.forEach(item => {
      languageCount[item.language] = (languageCount[item.language] || 0) + 1;
    });

    const favoriteLanguages = Object.entries(languageCount)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);

    // 今月の変換数を計算
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthCount = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
    }).length;

    setStats({
      favoriteLanguages,
      thisMonthCount,
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await deleteHistory(deleteConfirm.id);

      // Remove from local state
      const updatedHistory = myHistory.filter(item => item.id !== deleteConfirm.id);
      setMyHistory(updatedHistory);
      calculateStats(updatedHistory);

      // Update localStorage
      localStorage.setItem('katakanizer_history', JSON.stringify(updatedHistory));

      setDeleteConfirm(null);
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFavoriteToggle = async (id: number, isFavorite: boolean) => {
    try {
      // APIを呼び出してトグル
      const result = await addToFavorites(id);

      // 履歴のお気に入り状態を更新
      const updatedHistory = myHistory.map(item =>
        item.id === id ? { ...item, is_favorite: result.is_favorite } : item
      );
      setMyHistory(updatedHistory);
      localStorage.setItem('katakanizer_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 md:ml-64">
      <ProfileHeader user={user} stats={stats} conversionStatus={conversionStatus} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
        {activeTab === 'history' && (
          <HistoryTab
            myHistory={myHistory}
            isLoading={isLoading}
            onHistoryClick={onHistoryClick}
            onDeleteClick={(id, title) => setDeleteConfirm({ id, title })}
            onFavoriteToggle={handleFavoriteToggle}
          />
        )}

        {activeTab === 'favorites' && <FavoritesTab onHistoryClick={onHistoryClick} />}

        {activeTab === 'profile' && (
          <SettingsTab
            user={user}
            onLogout={logout}
            stats={stats}
          />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={deleteConfirm?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}