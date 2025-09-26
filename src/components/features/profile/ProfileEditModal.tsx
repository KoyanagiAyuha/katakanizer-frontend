'use client';

import { useState } from 'react';
import { useApiService } from '../../../services/api';
import Toast, { useToast } from '../../ui/Toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    email: string;
  };
  onUpdate: () => void;
}

export default function ProfileEditModal({ isOpen, onClose, currentUser, onUpdate }: ProfileEditModalProps) {
  const [activeTab, setActiveTab] = useState<'username' | 'email' | 'password'>('username');
  const [loading, setLoading] = useState(false);
  const { updateUsername, updateEmail, updatePassword } = useApiService();
  const { toasts, addToast, removeToast } = useToast();

  // Username form
  const [newUsername, setNewUsername] = useState(currentUser.username);

  // Email form
  const [newEmail, setNewEmail] = useState(currentUser.email);
  const [emailPassword, setEmailPassword] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    } catch (error: any) {
      addToast({ type: 'error', title: 'エラー', message: error.message || 'ユーザー名の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newEmail === currentUser.email) {
      addToast({ type: 'info', title: '変更なし', message: 'メールアドレスが同じです' });
      return;
    }

    if (!emailPassword) {
      addToast({ type: 'error', title: 'エラー', message: 'パスワードを入力してください' });
      return;
    }

    setLoading(true);
    try {
      await updateEmail(newEmail, emailPassword);
      addToast({ type: 'success', title: '成功', message: 'メールアドレスを更新しました。確認メールをご確認ください。' });
      onUpdate();
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      addToast({ type: 'error', title: 'エラー', message: error.message || 'メールアドレスの更新に失敗しました' });
    } finally {
      setLoading(false);
      setEmailPassword('');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'エラー', message: '新しいパスワードが一致しません' });
      return;
    }

    if (newPassword.length < 8) {
      addToast({ type: 'error', title: 'エラー', message: 'パスワードは8文字以上である必要があります' });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      addToast({ type: 'success', title: '成功', message: 'パスワードを更新しました' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      addToast({ type: 'error', title: 'エラー', message: error.message || 'パスワードの更新に失敗しました' });
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

            {/* Tabs */}
            <div className="flex border-b mb-6">
              <button
                onClick={() => setActiveTab('username')}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                  activeTab === 'username'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ユーザー名
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                  activeTab === 'email'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                メールアドレス
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                  activeTab === 'password'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                パスワード
              </button>
            </div>

            {/* Username Tab */}
            {activeTab === 'username' && (
              <form onSubmit={handleUsernameUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいユーザー名
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
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいメールアドレス
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="example@email.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    現在のパスワード（確認用）
                  </label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="パスワードを入力"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || newEmail === currentUser.email || !emailPassword}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  {loading ? '更新中...' : 'メールアドレスを更新'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    現在のパスワード
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="現在のパスワード"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいパスワード
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="8文字以上、大文字・小文字・数字・特殊文字を含む"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいパスワード（確認）
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="新しいパスワードを再入力"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  {loading ? '更新中...' : 'パスワードを更新'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}