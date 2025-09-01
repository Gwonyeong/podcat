'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/main');
    }
  }, [status, router]);

  const handleLogin = () => {
    signIn('kakao');
  };

  if (status === 'loading' || status === 'authenticated') {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <button 
        onClick={handleLogin} 
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#FEE500',
          color: '#391B1B',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}
      >
        카카오로 로그인
      </button>
    </div>
  );
}
