'use client';

import { useState, useEffect } from 'react';
import { useApiService } from '../../../services/api';
import HistoryItem from '../dashboard/HistoryItem';
import ConversionDetailModal from '../dashboard/ConversionDetailModal';
import Toast, { useToast } from '../../ui/Toast';

interface FavoritesPageProps {
  onHistoryClick?: (item: any) => void;
}

export default function FavoritesPage({ onHistoryClick }: FavoritesPageProps) {
  const { getMyFavorites, removeFromFavorites } = useApiService();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { toasts, addToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const data = await getMyFavorites(ITEMS_PER_PAGE, 0);

      const formattedFavorites = data.map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.created_at).toLocaleString('ja-JP'),
        text: item.original_text,
        title: item.title,
        language: item.language,
        username: item.username,
        is_favorite: true,
        result: {
          title: item.title,
          word_mappings: item.word_mappings
        }
      }));

      setFavorites(formattedFavorites);
      setOffset(ITEMS_PER_PAGE);
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      addToast({
        type: 'error',
        title: 'お気に入りの読み込みに失敗しました',
        message: '再度お試しください',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreFavorites = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const newFavorites = await getMyFavorites(ITEMS_PER_PAGE, offset);

      if (newFavorites.length === 0) {
        setHasMore(false);
        return;
      }

      const formattedNewFavorites = newFavorites.map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.created_at).toLocaleString('ja-JP'),
        text: item.original_text,
        title: item.title,
        language: item.language,
        username: item.username,
        is_favorite: true,
        result: {
          title: item.title,
          word_mappings: item.word_mappings
        }
      }));

      const updatedFavorites = [...favorites, ...formattedNewFavorites];
      setFavorites(updatedFavorites);
      setOffset(offset + ITEMS_PER_PAGE);
      setHasMore(newFavorites.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load more favorites:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !isLoadingMore) {
        loadMoreFavorites();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, offset, favorites]);

  const handleFavoriteToggle = async (id: number, isFavorite: boolean) => {
    try {
      if (!isFavorite) {
        await removeFromFavorites(id);
        addToast({
          type: 'success',
          title: 'お気に入りから削除しました',
          message: '',
          duration: 3000,
        });

        // お気に入りリストから削除
        const updatedFavorites = favorites.filter(item => item.id !== id);
        setFavorites(updatedFavorites);
      }
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
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="md:ml-64 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">お気に入り</h1>
              <div className="text-sm text-gray-600">
                {favorites.length}件のお気に入り
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : favorites.length > 0 ? (
              favorites.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  user={null}
                  onClick={() => setSelectedHistory(item)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">お気に入りがありません</h3>
                <p className="text-gray-600 mb-8">
                  カタカナ変換を作成して、お気に入りに追加してみましょう
                </p>
              </div>
            )}

            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-600">さらに読み込み中...</span>
              </div>
            )}

            {/* End of results indicator */}
            {!hasMore && favorites.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">すべてのお気に入りを表示しました</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <ConversionDetailModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        historyItem={selectedHistory}
      />
    </>
  );
}