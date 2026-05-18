'use client';

import { useState } from 'react';
import { useApiService } from '../../../services/api';
import Toast, { useToast } from '../../ui/Toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
  };
  onUpdate: () => void;
}

export default function ProfileEditModal({ isOpen, onClose, currentUser, onUpdate }: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false);
  const { updateUsername } = useApiService();
  const { toasts, addToast, removeToast } = useToast();

  const [newUsername, setNewUsername] = useState(currentUser.username);

  if (!isOpen) return null;

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newUsername === currentUser.username) {
      addToast({ type: 'info', title: '変更なし', message: 'ユーザー名が同じです' });
      return;
    }

    setLoading(true);
    try {
      await updateUsername(newUsername);
      addToast({ type: 'success', title: '成功', message: 'ユーザー名を更新しました' });
      onUpdate();
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ユーザー名の更新に失敗しました';
      addToast({ type: 'error', title: 'エラー', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">プロフィール編集</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUsernameUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="3〜30文字の英数字とアンダースコア"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || newUsername === currentUser.username}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors"
              >
                {loading ? '更新中...' : 'ユーザー名を更新'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                メールアドレスやパスワードの変更は、ログインページの「パスワードをお忘れですか？」から行えます。
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
