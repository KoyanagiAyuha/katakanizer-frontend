'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from './Navigation';
import Footer from './Footer';
import Dashboard from '../features/dashboard/Dashboard';
import ProfilePage from '../features/profile/ProfilePage';
import SearchPage from '../features/search/SearchPage';
import ConversionDetailModal from '../features/dashboard/ConversionDetailModal';
import { ConversionHistoryItem } from '../../types';

export default function MainApp() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'profile'>('home');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<ConversionHistoryItem | null>(null);

  // ページ切り替え
  const handlePageChange = (page: 'home' | 'search' | 'profile') => {
    setCurrentPage(page);
    setSelectedHistory(null); // 詳細モーダルを閉じる
  };

  // 作成ボタン
  const handleCreateClick = () => {
    setCurrentPage('home'); // ホームページに切り替え
    setShowCreateModal(true);
  };

  // 履歴アイテムクリック（詳細表示）
  const handleHistoryClick = (item: ConversionHistoryItem) => {
    setSelectedHistory(item);
  };

  if (!user) {
    return null; // AuthContextで認証状態を管理
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* ナビゲーション */}
      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onCreateClick={handleCreateClick}
      />

      {/* メインコンテンツ */}
      <div className="flex-grow">
        {currentPage === 'home' && (
          <Dashboard
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            onHistoryClick={handleHistoryClick}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage onHistoryClick={handleHistoryClick} />
        )}

        {currentPage === 'profile' && (
          <ProfilePage onHistoryClick={handleHistoryClick} />
        )}
      </div>

      {/* フッター */}
      <Footer className="md:ml-64" />

      {/* 共通の詳細モーダル */}
      <ConversionDetailModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        historyItem={selectedHistory}
      />
    </div>
  );
}