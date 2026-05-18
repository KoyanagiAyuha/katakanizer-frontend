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
import { ConversionHistoryItem, User } from '../../../types';
import { formatApiHistory } from '../../../utils/formatting';

interface DashboardProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  onHistoryClick?: (item: ConversionHistoryItem) => void;
}

export default function Dashboard({ showCreateModal, setShowCreateModal }: DashboardProps) {
  const { user } = useAuth();
  const { convertText, getRecentHistory, addToFavorites } = useApiService();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<ConversionHistoryItem | null>(null);
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

        const formattedHistory = apiHistory.map(formatApiHistory);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 無限スクロール用の追加データ読み込み関数
  const loadMoreHistory = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const newHistory = await getRecentHistory(ITEMS_PER_PAGE, offset);

      if (newHistory.length === 0) {
        setHasMore(false);
        return;
      }

      const formattedNewHistory = newHistory.map(formatApiHistory);

      // 重複を除いて追加
      setHistory(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewHistory = formattedNewHistory.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewHistory];
      });
      setOffset(prev => prev + ITEMS_PER_PAGE);
      setHasMore(newHistory.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load more history:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, offset, getRecentHistory]);

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
  }, [hasMore, isLoadingMore, loadMoreHistory]);

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

        // サーバーから返されたデータを使って履歴に追加
        if (data.id) {
          const newHistoryItem: ConversionHistoryItem = {
            id: data.id,
            timestamp: new Date().toLocaleString('ja-JP'),
            text: text.trim(),
            title: data.title || title.trim() || `${new Date().toLocaleDateString('ja-JP')} 変換`,
            language,
            is_favorite: false,
            result: {
              title: data.title,
              word_mappings: data.word_mappings
            }
          };
          setHistory(prev => [newHistoryItem, ...prev]);
        } else {
          // 履歴を再取得して最新状態を反映
          const apiHistory = await getRecentHistory(ITEMS_PER_PAGE, 0);
          const formattedHistory = apiHistory.map(formatApiHistory);
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
    } catch (error: unknown) {
      console.error('Error:', error);

      const err = error as { name?: string; message?: string };
      // エラートーストに更新
      if (err.name !== 'AbortError') {
        updateToast(toastId, {
          type: 'error',
          title: '変換に失敗しました',
          message: err.message || 'もう一度お試しください',
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
  }, [text, title, language, isLoading, isConverting, convertText, addToast, removeToast, updateToast, setShowCreateModal, getRecentHistory]);

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

  const handleFavoriteToggle = async (id: number, _isFavorite: boolean) => {
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
      setHistory(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_favorite: result.is_favorite } : item
        )
      );
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
                  user={user as User | null}
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
