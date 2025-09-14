'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApiService } from '../services/api';
import Toast, { useToast } from './Toast';

interface DashboardProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  onHistoryClick?: (item: any) => void;
}

export default function Dashboard({ showCreateModal, setShowCreateModal, onHistoryClick }: DashboardProps) {
  const { user } = useAuth();
  const { convertText, getMyHistory, getRecentHistory } = useApiService();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [displayMode, setDisplayMode] = useState<'casual' | 'formal'>('casual');
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
                <article 
                  key={item.id} 
                  className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedHistory(item)}
                >
                  {/* Post Header */}
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
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                        {item.language === 'en' ? '🇺🇸 English' : 
                         item.language === 'ko' ? '🇰🇷 Korean' :
                         item.language === 'fr' ? '🇫🇷 French' :
                         item.language === 'es' ? '🇪🇸 Spanish' :
                         item.language === 'de' ? '🇩🇪 German' :
                         item.language === 'it' ? '🇮🇹 Italian' :
                         item.language === 'pt' ? '🇵🇹 Portuguese' :
                         item.language === 'zh' ? '🇨🇳 Chinese' :
                         item.language === 'ja' ? '🇯🇵 Japanese' : item.language}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  </div>
                  
                  {/* Original Text */}
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <div className="text-gray-600 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                        {item.text}
                      </div>
                    </div>
                    
                    {/* Conversion Preview */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                      <div className="text-indigo-900 text-base" style={{ lineHeight: '2.5' }}>
                        {item.result.word_mappings?.slice(0, 5).map((mapping: any, index: number) => (
                          <ruby key={index} className="mr-1">
                            <span>{mapping.line}</span>
                            <rt className="text-xs">{mapping.casual}</rt>
                          </ruby>
                        ))}
                        {item.result.word_mappings?.length > 5 && (
                          <span className="text-gray-400 text-sm">
                            ...({item.result.word_mappings.length - 5} more phrases)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">まだ変換履歴がありません</h3>
                <p className="text-gray-500 mb-6">最初の変換を作成して、あなたの学習を始めましょう！</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  変換を作成する
                </button>
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
            {!hasMore && history.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">すべての履歴を表示しました</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">新しい変換を作成</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Language Selection */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-800 mb-2">
                    言語
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800 bg-white"
                  >
                    <option value="en">🇺🇸 英語 (English)</option>
                    <option value="ko">🇰🇷 韓国語 (Korean)</option>
                    <option value="fr">🇫🇷 フランス語 (French)</option>
                    <option value="es">🇪🇸 スペイン語 (Spanish)</option>
                    <option value="de">🇩🇪 ドイツ語 (German)</option>
                    <option value="it">🇮🇹 イタリア語 (Italian)</option>
                    <option value="pt">🇵🇹 ポルトガル語 (Portuguese)</option>
                    <option value="zh">🇨🇳 中国語 (Chinese)</option>
                    <option value="ja">🇯🇵 日本語 (Japanese)</option>
                  </select>
                </div>

                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-2">
                    タイトル（任意）
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800 bg-white"
                    placeholder="例：歌詞、映画のセリフ、フレーズ集など..."
                    disabled={isLoading}
                  />
                </div>

                {/* Text Input */}
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-800 mb-2">
                    変換するテキスト
                  </label>
                  <textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-800 bg-white"
                    placeholder="変換したいテキストを入力してください..."
                    disabled={isLoading}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleConvert}
                    disabled={!text.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        変換中...
                      </div>
                    ) : (
                      '変換する'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
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
                } text-lg`} style={{ lineHeight: '3' }}>
                  {selectedHistory.result.word_mappings?.map((mapping: any, index: number) => (
                    <ruby key={index} className="mr-1">
                      <span>{mapping.line}</span>
                      <rt className="text-sm">{displayMode === 'casual' ? mapping.casual : mapping.formal}</rt>
                    </ruby>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}