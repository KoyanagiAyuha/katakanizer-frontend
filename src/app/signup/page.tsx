'use client';

import { useEffect } from 'react';
import RegisterForm from '../../components/features/auth/RegisterForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // ログイン済みの場合はメインページへリダイレクト
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <RegisterForm
      onSwitchToLogin={() => router.push('/login')}
      onBack={() => router.push('/')}
    />
  );
}