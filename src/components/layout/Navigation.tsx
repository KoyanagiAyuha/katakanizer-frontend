'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  currentPage: 'home' | 'search' | 'profile';
  onPageChange: (page: 'home' | 'search' | 'profile') => void;
  onCreateClick: () => void;
}

export default function Navigation({ currentPage, onPageChange, onCreateClick }: NavigationProps) {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'ホーム',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d={active ? "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"} />
        </svg>
      ),
    },
    {
      id: 'search',
      label: '検索',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Katakanizer
            </h1>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as 'home' | 'search' | 'profile')}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 w-full ${
                  currentPage === item.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="mr-3">
                  {item.icon(currentPage === item.id)}
                </div>
                {item.label}
              </button>
            ))}
            
            <button
              onClick={onCreateClick}
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <div className="mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              作成
            </button>
            
            <button
              onClick={() => onPageChange('profile')}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 w-full ${
                currentPage === 'profile'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="mr-3 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.username?.charAt(0)?.toUpperCase()}</span>
              </div>
              プロフィール
            </button>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={logout}
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 w-full text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <div className="mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as 'home' | 'search' | 'profile')}
              className={`flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
                currentPage === item.id ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              {item.icon(currentPage === item.id)}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={onCreateClick}
            className="flex flex-col items-center justify-center p-2 text-gray-600"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs mt-1">作成</span>
          </button>
          
          <button
            onClick={() => onPageChange('profile')}
            className={`flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
              currentPage === 'profile' ? 'text-indigo-600' : 'text-gray-600'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              currentPage === 'profile' 
                ? 'bg-gradient-to-br from-indigo-400 to-purple-500' 
                : 'bg-gray-300'
            }`}>
              <span className="text-white font-semibold text-xs">{user?.username?.charAt(0)?.toUpperCase()}</span>
            </div>
            <span className="text-xs mt-1">プロフィール</span>
          </button>
        </div>
      </div>
    </>
  );
}