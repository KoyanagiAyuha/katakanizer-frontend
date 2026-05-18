'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApiService } from '../../../services/api';
import { getLanguageLabel } from '../../../utils/formatting';

interface SettingsTabProps {
  user: {
    username: string;
    is_premium?: boolean;
  } | null;
  onLogout: () => void;
  stats: {
    favoriteLanguages: Array<{ language: string; count: number }>;
    thisMonthCount: number;
  };
  onUsernameUpdate?: (newUsername: string) => void;
}

export default function SettingsTab({ user, onLogout, stats, onUsernameUpdate }: SettingsTabProps) {
  const { firebaseUser, updateEmail, updatePassword } = useAuth();
  const { updateUsername } = useApiService();

  // ユーザー名編集
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // メールアドレス変更
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // パスワード変更
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 成功メッセージ
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // ユーザー名編集
  const handleUsernameEdit = () => {
    setNewUsername(user?.username || '');
    setIsEditingUsername(true);
    setUsernameError(null);
    setSuccessMessage(null);
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername(user?.username || '');
    setUsernameError(null);
  };

  const handleUsernameSave = async () => {
    if (!newUsername.trim()) {
      setUsernameError('ユーザー名を入力してください');
      return;
    }

    if (newUsername.trim() === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    setIsUpdatingUsername(true);
    setUsernameError(null);

    try {
      const result = await updateUsername(newUsername.trim());
      setIsEditingUsername(false);
      showSuccess('ユーザー名を更新しました');
      if (onUsernameUpdate) {
        onUsernameUpdate(result.username);
      }
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'ユーザー名の更新に失敗しました');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // メールアドレス変更
  const handleEmailEdit = () => {
    setNewEmail('');
    setEmailCurrentPassword('');
    setIsEditingEmail(true);
    setEmailError(null);
    setSuccessMessage(null);
  };

  const handleEmailCancel = () => {
    setIsEditingEmail(false);
    setNewEmail('');
    setEmailCurrentPassword('');
    setEmailError(null);
  };

  const handleEmailSave = async () => {
    if (!newEmail.trim()) {
      setEmailError('新しいメールアドレスを入力してください');
      return;
    }

    if (!emailCurrentPassword) {
      setEmailError('現在のパスワードを入力してください');
      return;
    }

    if (newEmail.trim() === firebaseUser?.email) {
      setEmailError('現在と同じメールアドレスです');
      return;
    }

    setIsUpdatingEmail(true);
    setEmailError(null);

    try {
      await updateEmail(emailCurrentPassword, newEmail.trim());
      setIsEditingEmail(false);
      setNewEmail('');
      setEmailCurrentPassword('');
      showSuccess('確認メールを送信しました。新しいメールアドレスで確認を完了してください。');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'メールアドレスの変更に失敗しました');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // パスワード変更
  const handlePasswordEdit = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditingPassword(true);
    setPasswordError(null);
    setSuccessMessage(null);
  };

  const handlePasswordCancel = () => {
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handlePasswordSave = async () => {
    if (!currentPassword) {
      setPasswordError('現在のパスワードを入力してください');
      return;
    }

    if (!newPassword) {
      setPasswordError('新しいパスワードを入力してください');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('パスワードは6文字以上で入力してください');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワードが一致しません');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);

    try {
      await updatePassword(currentPassword, newPassword);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('パスワードを変更しました');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'パスワードの変更に失敗しました');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">アカウント設定</h2>

      {/* アカウント情報 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h3>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          {/* ユーザー名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
            {isEditingUsername ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="新しいユーザー名"
                  disabled={isUpdatingUsername}
                />
                {usernameError && (
                  <p className="text-sm text-red-600">{usernameError}</p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={handleUsernameSave}
                    disabled={isUpdatingUsername}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdatingUsername ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleUsernameCancel}
                    disabled={isUpdatingUsername}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{user?.username}</span>
                <button
                  onClick={handleUsernameEdit}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  編集
                </button>
              </div>
            )}
          </div>

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            {isEditingEmail ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="新しいメールアドレス"
                  disabled={isUpdatingEmail}
                />
                <input
                  type="password"
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="現在のパスワード"
                  disabled={isUpdatingEmail}
                />
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
                <p className="text-xs text-gray-500">
                  変更後、新しいメールアドレスに確認メールが送信されます。
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEmailSave}
                    disabled={isUpdatingEmail}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdatingEmail ? '送信中...' : '変更'}
                  </button>
                  <button
                    onClick={handleEmailCancel}
                    disabled={isUpdatingEmail}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{firebaseUser?.email || '-'}</span>
                <button
                  onClick={handleEmailEdit}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  編集
                </button>
              </div>
            )}
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            {isEditingPassword ? (
              <div className="space-y-2">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="現在のパスワード"
                  disabled={isUpdatingPassword}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="新しいパスワード（6文字以上）"
                  disabled={isUpdatingPassword}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="新しいパスワード（確認）"
                  disabled={isUpdatingPassword}
                />
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={handlePasswordSave}
                    disabled={isUpdatingPassword}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdatingPassword ? '変更中...' : '変更'}
                  </button>
                  <button
                    onClick={handlePasswordCancel}
                    disabled={isUpdatingPassword}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-900">••••••••</span>
                <button
                  onClick={handlePasswordEdit}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  編集
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 利用統計 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">利用統計</h3>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.thisMonthCount}</div>
          <div className="text-sm text-purple-800">今月の変換数</div>
        </div>

        {stats.favoriteLanguages.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">よく使う言語</h4>
            <div className="space-y-2">
              {stats.favoriteLanguages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{getLanguageLabel(lang.language)}</span>
                  <span className="text-sm font-medium text-gray-900">{lang.count}回</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* アクション */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
        <div className="space-y-4">
          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}
