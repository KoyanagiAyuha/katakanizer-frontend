'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function FavoritesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // プロフィールページのお気に入りセクションにリダイレクト
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <LoadingSpinner size="lg" color="pink" text="リダイレクト中..." />
    </div>
  );
}