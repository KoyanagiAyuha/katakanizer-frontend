'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1 mb-3 sm:mb-0">
            <p className="text-sm text-gray-600">
              当サイトでは、より良いサービスを提供するためにCookieを使用しています。
              Cookieの使用に同意いただける場合は「同意する」をクリックしてください。
              詳細は
              <a href="/privacy" className="text-purple-600 hover:text-purple-700 underline mx-1">
                プライバシーポリシー
              </a>
              をご覧ください。
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              拒否する
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              同意する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}