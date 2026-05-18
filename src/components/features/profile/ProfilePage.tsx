'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';
import ProfileHeader from './ProfileHeader';
import TabNavigation from './TabNavigation';
import HistoryTab from './HistoryTab';
import FavoritesTab from './FavoritesTab';
import SettingsTab from './SettingsTab';
import DeleteConfirmModal from './DeleteConfirmModal';
import { ConversionHistoryItem, LanguageStats } from '../../../types';
import { formatApiHistory } from '../../../utils/formatting';

interface ProfilePageProps {
  onHistoryClick?: (item: ConversionHistoryItem) => void;
}

export default function ProfilePage({ onHistoryClick }: ProfilePageProps) {
  const { user, logout, updateUserInfo } = useAuth();
  const { getMyHistory, deleteHistory, toggleFavorite, getConversionStatus } = useApiService();
  const [myHistory, setMyHistory] = useState<ConversionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'profile'>('history');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    favoriteLanguages: [] as LanguageStats[],
  });
  const [conversionStatus, setConversionStatus] = useState<{
    can_convert: boolean;
    remaining_conversions: number;
    daily_limit: number;
    is_premium: boolean;
  } | null>(null);

  const calculateStats = useCallback((history: ConversionHistoryItem[]) => {
    const languageCount: Record<string, number> = {};
    history.forEach(item => {
      languageCount[item.language] = (languageCount[item.language] || 0) + 1;
    });

    const favoriteLanguages = Object.entries(languageCount)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats(prev => ({
      ...prev,
      favoriteLanguages,
    }));
  }, []);

  // 自分の変換履歴を読み込み
  useEffect(() => {
    const loadMyHistory = async () => {
      setIsLoading(true);
      try {
        const apiHistory = await getMyHistory();
        const formattedHistory = apiHistory.map(formatApiHistory);
        setMyHistory(formattedHistory);
        calculateStats(formattedHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
        setMyHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadMyHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, calculateStats]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, myHistory]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await deleteHistory(deleteConfirm.id);

      const updatedHistory = myHistory.filter(item => item.id !== deleteConfirm.id);
      setMyHistory(updatedHistory);
      calculateStats(updatedHistory);

      setDeleteConfirm(null);
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFavoriteToggle = async (id: number) => {
    try {
      const result = await toggleFavorite(id);

      const updatedHistory = myHistory.map(item =>
        item.id === id ? { ...item, is_favorite: result.is_favorite } : item
      );
      setMyHistory(updatedHistory);
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
            stats={{
              ...stats,
              thisMonthCount: conversionStatus?.daily_limit
                ? conversionStatus.daily_limit - conversionStatus.remaining_conversions
                : 0,
            }}
            onUsernameUpdate={(newUsername) => updateUserInfo({ username: newUsername })}
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
