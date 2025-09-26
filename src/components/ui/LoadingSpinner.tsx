'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'indigo' | 'white' | 'pink' | 'blue' | 'purple';
  text?: string;
  inline?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'indigo',
  text,
  inline = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    indigo: 'border-indigo-500',
    white: 'border-white',
    pink: 'border-pink-500',
    blue: 'border-blue-600',
    purple: 'border-purple-600'
  };

  if (inline) {
    return (
      <div className="flex items-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]}`}></div>
        {text && <span className="ml-2">{text}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]}`}></div>
      {text && <p className="mt-3 text-gray-600">{text}</p>}
    </div>
  );
}

// 便利なプリセットコンポーネント
export function PageLoadingSpinner() {
  return <LoadingSpinner size="lg" text="読み込み中..." />;
}

export function ButtonLoadingSpinner() {
  return <LoadingSpinner size="sm" color="white" inline />;
}

export function InlineLoadingSpinner({ text }: { text?: string }) {
  return <LoadingSpinner size="md" text={text} inline />;
}