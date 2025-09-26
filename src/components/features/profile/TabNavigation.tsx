'use client';

import React from 'react';

interface TabNavigationProps {
  activeTab: 'history' | 'favorites' | 'profile';
  setActiveTab: (tab: 'history' | 'favorites' | 'profile') => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: 'history' as const, label: '変換履歴' },
    { id: 'favorites' as const, label: 'お気に入り' },
    { id: 'profile' as const, label: '設定' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}