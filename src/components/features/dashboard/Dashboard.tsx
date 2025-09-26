'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';
import Toast, { useToast } from '../../ui/Toast';
import ConversionCreateModal from './ConversionCreateModal';
import ConversionDetailModal from './ConversionDetailModal';
import HistoryItem from './HistoryItem';
import EmptyState from '../../ui/EmptyState';

interface DashboardProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  onHistoryClick?: (item: any) => void;
}

export default function Dashboard({ showCreateModal, setShowCreateModal, onHistoryClick }: DashboardProps) {
  const { user } = useAuth();
  const { convertText, getMyHistory, getRecentHistory, addToFavorites, removeFromFavorites } = useApiService();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { toasts, addToast, removeToast, updateToast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [offset, setOffset] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // コンポーネントマウント時に履歴を読み込み
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // まずlocalStorageから履歴を読み込み
        const savedHistory = localStorage.getItem('katakanizer_history');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }

        // APIから最新の公開履歴を取得してマージ
        try {
          const apiHistory = await getRecentHistory(ITEMS_PER_PAGE, 0);
          setOffset(ITEMS_PER_PAGE);
          
          // API履歴をフロントエンド形式に変換
          const formattedHistory = apiHistory.map((item: any) => ({
            id: item.id,
            timestamp: new Date(item.created_at).toLocaleString('ja-JP'),
            text: item.original_text,
            title: item.title,
            language: item.language,
            username: item.username,  // APIから取得したユーザー名を保持
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
          
          setHistory(mergedHistory);
          setHasMore(apiHistory.length === ITEMS_PER_PAGE);
          
          // localStorageを更新
          localStorage.setItem('katakanizer_history', JSON.stringify(mergedHistory));
        } catch (error) {
          console.error('Failed to load history:', error);
          // エラーの場合はlocalStorageの履歴のみ使用
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    if (user) {
      loadHistory();
    }
  }, [user]);

  // 無限スクロール用の追加データ読み込み関数
  const loadMoreHistory = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const newHistory = await getRecentHistory(ITEMS_PER_PAGE, offset);
      
      if (newHistory.length === 0) {
        setHasMore(false);
        return;
      }

      // API履歴をフロントエンド形式に変換
      const formattedNewHistory = newHistory.map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.created_at).toLocaleString('ja-JP'),
        text: item.original_text,
        title: item.title,
        language: item.language,
        username: item.username,  // APIから取得したユーザー名を保持
        is_favorite: item.is_favorite || false,
        result: {
          title: item.title,
          word_mappings: item.word_mappings
        }
      }));

      // 重複を除いて追加
      const existingIds = new Set(history.map(item => item.id));
      const uniqueNewHistory = formattedNewHistory.filter(item => !existingIds.has(item.id));

      const updatedHistory = [...history, ...uniqueNewHistory];
      setHistory(updatedHistory);
      setOffset(offset + ITEMS_PER_PAGE);
      setHasMore(newHistory.length === ITEMS_PER_PAGE);

      // localStorageを更新
      localStorage.setItem('katakanizer_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to load more history:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // スクロールイベントリスナー
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // 画面の底から200px以内にスクロールしたら次のページを読み込み
      if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !isLoadingMore) {
        loadMoreHistory();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, offset, history]);

  const handleConvert = async () => {
    if (!text.trim()) return;

    // AbortControllerを作成
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setIsLoading(true);
    setIsConverting(true);
    
    // トーストで進捗を表示
    const toastId = addToast({
      type: 'loading',
      title: '変換中...',
      message: title.trim() || text.trim().substring(0, 30) + '...',
      duration: 0,
    });
    
    // モーダルを閉じる（変換はバックグラウンドで継続）
    setShowCreateModal(false);
    
    try {
      const data = await convertText({
        text: text.trim(),
        title: title.trim() || `${new Date().toLocaleDateString('ja-JP')} 変換`,
        language,
      }, abortController.signal);
      
      // リクエストがキャンセルされていないか確認
      if (abortController.signal.aborted) {
        removeToast(toastId);
        return;
      }
      
      setResult(data);
        
        // 履歴に追加
        const newHistoryItem = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('ja-JP'),
          text: text.trim(),
          title: title.trim() || `${new Date().toLocaleDateString('ja-JP')} 変換`,
          language,
          result: data,
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        
        // localStorageにも保存
        localStorage.setItem('katakanizer_history', JSON.stringify(updatedHistory));
        
        // 成功トーストに更新
        updateToast(toastId, {
          type: 'success',
          title: '変換完了！',
          message: `「${title.trim() || text.trim().substring(0, 30)}...」の変換が完了しました`,
          duration: 5000,
        });
        
        setText('');
        setTitle('');
    } catch (error: any) {
      console.error('Error:', error);
      
      // エラートーストに更新
      if (error.name !== 'AbortError') {
        updateToast(toastId, {
          type: 'error',
          title: '変換に失敗しました',
          message: error.message || 'もう一度お試しください',
          duration: 5000,
        });
      } else {
        removeToast(toastId);
      }
    } finally {
      setIsLoading(false);
      setIsConverting(false);
      abortControllerRef.current = null;
    }
  };

  // リロード時の警告を設定
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConverting) {
        e.preventDefault();
        e.returnValue = '変換処理中です。ページを離れると変換が中断されます。';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isConverting]);

  const handleFavoriteToggle = async (id: number, isFavorite: boolean) => {
    try {
      // APIを呼び出してトグル
      const result = await addToFavorites(id);

      if (result.is_favorite) {
        addToast({
          type: 'success',
          title: 'お気に入りに追加しました',
          message: '',
          duration: 3000,
        });
      } else {
        addToast({
          type: 'success',
          title: 'お気に入りから削除しました',
          message: '',
          duration: 3000,
        });
      }

      // 履歴のお気に入り状態を更新
      const updatedHistory = history.map(item =>
        item.id === id ? { ...item, is_favorite: result.is_favorite } : item
      );
      setHistory(updatedHistory);
      localStorage.setItem('katakanizer_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to update favorite:', error);
      addToast({
        type: 'error',
        title: 'エラーが発生しました',
        message: 'お気に入りの更新に失敗しました',
        duration: 5000,
      });
    }
  };

  return (
    <>
      {/* Toast通知 */}
      <Toast toasts={toasts} onRemove={removeToast} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 md:ml-64">

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* History Feed */}
          <div className="space-y-6">
            {history.length > 0 ? (
              history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  user={user}
                  onClick={() => setSelectedHistory(item)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))
            ) : (
              <EmptyState onCreateClick={() => setShowCreateModal(true)} />
            )}
            
            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-600">さらに読み込み中...</span>
              </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && history.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">すべての履歴を表示しました</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ConversionCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        text={text}
        setText={setText}
        title={title}
        setTitle={setTitle}
        language={language}
        setLanguage={setLanguage}
        isLoading={isLoading}
        onConvert={handleConvert}
      />

      <ConversionDetailModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        historyItem={selectedHistory}
      />
    </>
  );
}