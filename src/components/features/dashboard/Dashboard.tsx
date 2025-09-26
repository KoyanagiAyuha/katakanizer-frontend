'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';
import Toast, { useToast } from '../../ui/Toast';
import ConversionCreateModal from './ConversionCreateModal';
import ConversionDetailModal from './ConversionDetailModal';
import HistoryItem from './HistoryItem';
import EmptyState from '../../ui/EmptyState';
import { PageLoadingSpinner, InlineLoadingSpinner } from '../../ui/LoadingSpinner';

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
  const lastRequestTimeRef = useRef(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // コンポーネントマウント時に履歴を読み込み
  useEffect(() => {
    let isCancelled = false;

    const loadHistory = async () => {
      setIsInitialLoading(true);
      try {
        const apiHistory = await getRecentHistory(ITEMS_PER_PAGE, 0);

        // コンポーネントがアンマウントされた場合は処理を中断
        if (isCancelled) {
          return;
        }

        setOffset(ITEMS_PER_PAGE);

        // API履歴をフロントエンド形式に変換
        const formattedHistory = apiHistory.map((item: any) => ({
          id: item.id,
          timestamp: new Date(item.created_at).toLocaleString('ja-JP'),
          text: item.original_text,
          title: item.title,
          language: item.language,
          username: item.username,
          is_favorite: item.is_favorite || false,
          result: {
            title: item.title,
            word_mappings: item.word_mappings
          }
        }));

        if (!isCancelled) {
          setHistory(formattedHistory);
          setHasMore(apiHistory.length === ITEMS_PER_PAGE);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        if (!isCancelled) {
          setHistory([]);
        }
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    if (user) {
      loadHistory();
    }

    // クリーンアップ関数
    return () => {
      isCancelled = true;
    };
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

  const handleConvert = useCallback(async () => {
    if (!text.trim()) return;

    // デバウンス処理：前回のリクエストから1秒未満の場合はスキップ
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 1000) {
      console.log('Request debounced - too soon after last request');
      return;
    }
    lastRequestTimeRef.current = now;

    // 既に処理中の場合は何もしない
    if (isLoading || isConverting) {
      console.log('Already processing, skipping duplicate request');
      return;
    }

    // 前のリクエストがあればキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しいAbortControllerを作成
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

        // サーバーから返されたデータを使って履歴に追加
        if (data.id) {
          const newHistoryItem = {
            id: data.id,
            timestamp: new Date().toLocaleString('ja-JP'),
            text: text.trim(),
            title: data.title || title.trim() || `${new Date().toLocaleDateString('ja-JP')} 変換`,
            language,
            username: user?.username,
            is_favorite: false,
            result: {
              title: data.title,
              word_mappings: data.word_mappings
            }
          };
          const updatedHistory = [newHistoryItem, ...history];
          setHistory(updatedHistory);
        } else {
          // 履歴を再取得して最新状態を反映
          const apiHistory = await getRecentHistory(ITEMS_PER_PAGE, 0);
          const formattedHistory = apiHistory.map((item: any) => ({
            id: item.id,
            timestamp: new Date(item.created_at).toLocaleString('ja-JP'),
            text: item.original_text,
            title: item.title,
            language: item.language,
            username: item.username,
            is_favorite: item.is_favorite || false,
            result: {
              title: item.title,
              word_mappings: item.word_mappings
            }
          }));
          setHistory(formattedHistory);
        }
        
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
  }, [text, title, language, isLoading, isConverting, convertText, history, addToast, removeToast, updateToast]);

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
            {isInitialLoading ? (
              <PageLoadingSpinner />
            ) : history.length > 0 ? (
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
              <InlineLoadingSpinner text="さらに読み込み中..." />
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