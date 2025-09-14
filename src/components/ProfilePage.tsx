'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApiService } from '../services/api';

interface ProfilePageProps {
  onHistoryClick?: (item: any) => void;
}

export default function ProfilePage({ onHistoryClick }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const { getMyHistory, deleteHistory } = useApiService();
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'profile'>('history');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalConversions: 0,
    favoriteLanguages: [] as { language: string; count: number }[],
    thisMonthCount: 0,
  });

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
            result: {
              title: item.title,
              word_mappings: item.word_mappings
            }
          }));

          // タイムスタンプでソート
          formattedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          setMyHistory(formattedHistory);
          calculateStats(formattedHistory);
          
          // localStorageを更新
          localStorage.setItem('katakanizer_history', JSON.stringify(formattedHistory));
        } catch (error) {
          console.error('Failed to load API history:', error);
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

  // 統計情報を計算
  const calculateStats = (history: any[]) => {
    const totalConversions = history.length;
    
    // 言語別の使用回数を計算
    const languageCounts: { [key: string]: number } = {};
    history.forEach(item => {
      languageCounts[item.language] = (languageCounts[item.language] || 0) + 1;
    });
    
    const favoriteLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 今月の変換数
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthCount = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
    }).length;

    setStats({
      totalConversions,
      favoriteLanguages,
      thisMonthCount,
    });
  };

  const getLanguageLabel = (language: string) => {
    const labels: { [key: string]: string } = {
      en: '🇺🇸 英語',
      ko: '🇰🇷 韓国語',
      fr: '🇫🇷 フランス語',
      es: '🇪🇸 スペイン語',
      de: '🇩🇪 ドイツ語',
      it: '🇮🇹 イタリア語',
      pt: '🇵🇹 ポルトガル語',
      zh: '🇨🇳 中国語',
      ja: '🇯🇵 日本語'
    };
    return labels[language] || language;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 md:ml-64">
      {/* プロフィールヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* アバター */}
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-3xl">{user?.username?.charAt(0)?.toUpperCase()}</span>
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

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              変換履歴
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'favorites'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              お気に入り
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              設定
            </button>
          </div>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">マイ変換履歴</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : myHistory.length > 0 ? (
              <div className="space-y-4">
                {myHistory.map((item) => (
                  <article 
                    key={item.id} 
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => onHistoryClick && onHistoryClick(item)}
                  >
                    {/* カードヘッダー */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{user?.username?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">@{user?.username}</div>
                            <div className="text-gray-500 text-xs">{item.timestamp}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                            {getLanguageLabel(item.language)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ id: item.id, title: item.title });
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    </div>
                    
                    {/* 原文 */}
                    <div className="px-6 pb-4">
                      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                        <div className="text-gray-600 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                          {item.text}
                        </div>
                      </div>
                      
                      {/* 変換プレビュー */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
                        <div className="text-indigo-900" style={{ lineHeight: '2.5' }}>
                          <ruby className="text-base">
                            {item.result.word_mappings?.slice(0, 10).map((mapping: any, index: number) => (
                              <React.Fragment key={index}>
                                <span>{mapping.line}</span>
                                <rt className="text-xs text-indigo-600">{mapping.casual}</rt>
                                {index < Math.min(item.result.word_mappings.length - 1, 9) ? ' ' : ''}
                              </React.Fragment>
                            ))}
                            {item.result.word_mappings?.length > 10 && <span className="text-gray-400">...</span>}
                          </ruby>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">変換履歴がありません</h3>
                <p className="text-gray-500">最初の変換を作成して、学習を始めましょう！</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">お気に入り</h2>
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">お気に入り機能は準備中です</h3>
              <p className="text-gray-500">近日中にお気に入り機能を追加予定です！</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">アカウント設定</h2>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ユーザー名</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* よく使う言語 */}
            {stats.favoriteLanguages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">よく使う言語</h3>
                <div className="space-y-3">
                  {stats.favoriteLanguages.map((lang, index) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <span className="text-gray-700">{getLanguageLabel(lang.language)}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(lang.count / stats.totalConversions) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{lang.count}回</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ログアウト */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント</h3>
              <button
                onClick={logout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-4 rounded-xl transition-colors duration-200 border border-red-200"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 削除確認モーダル */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">変換履歴を削除しますか？</h3>
            <p className="text-gray-600 text-center mb-2">「{deleteConfirm.title}」</p>
            <p className="text-sm text-gray-500 text-center mb-6">この操作は取り消せません。</p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    削除中...
                  </>
                ) : (
                  '削除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}