'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from './Navigation';
import Dashboard from '../features/dashboard/Dashboard';
import ProfilePage from '../features/profile/ProfilePage';
import SearchPage from '../features/search/SearchPage';

export default function MainApp() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'profile'>('home');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

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
  const handleHistoryClick = (item: any) => {
    setSelectedHistory(item);
  };

  // 詳細モーダル用の状態管理
  const [displayMode, setDisplayMode] = useState<'casual' | 'formal'>('casual');

  if (!user) {
    return null; // AuthContextで認証状態を管理
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* ナビゲーション */}
      <Navigation 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onCreateClick={handleCreateClick}
      />

      {/* メインコンテンツ */}
      <div className="min-h-screen">
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

      {/* 共通の詳細モーダル */}
      {selectedHistory && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedHistory(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedHistory.title}</h2>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Original Text */}
              <div className="mb-8">
                <div className="text-sm text-gray-500 mb-3">原文</div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="text-gray-800 leading-loose whitespace-pre-wrap text-base">
                    {selectedHistory.text}
                  </div>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setDisplayMode('casual')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    displayMode === 'casual'
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-indigo-500'
                  }`}
                >
                  カジュアル
                </button>
                <button
                  onClick={() => setDisplayMode('formal')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    displayMode === 'formal'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-purple-500'
                  }`}
                >
                  フォーマル
                </button>
              </div>

              {/* Conversion Result */}
              <div className={`${
                displayMode === 'casual' 
                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50'
              } rounded-2xl p-8`}>
                <div className={`${
                  displayMode === 'casual' ? 'text-indigo-900' : 'text-purple-900'
                } text-lg break-words overflow-hidden`} style={{ lineHeight: '3.5' }}>
                  <ruby className="whitespace-pre-wrap break-words">
                    {selectedHistory.result.word_mappings?.map((mapping: any, index: number) => (
                      <React.Fragment key={index}>
                        <span className="break-words">{mapping.line}</span>
                        <rt className="text-sm break-words">
                          {displayMode === 'casual' ? mapping.casual : mapping.formal}
                        </rt>
                        {index < selectedHistory.result.word_mappings.length - 1 ? ' ' : ''}
                      </React.Fragment>
                    ))}
                  </ruby>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}