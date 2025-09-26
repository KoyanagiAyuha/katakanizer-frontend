'use client';

import { useEffect } from 'react';
import LoginForm from '../../components/features/auth/LoginForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // ログイン済みの場合はメインページへリダイレクト
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <LoginForm
      onSwitchToRegister={() => router.push('/signup')}
      onBack={() => router.push('/')}
    />
  );
}