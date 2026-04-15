'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    if (token) {
      // Store the token
      localStorage.setItem('token', token);

      // Sign in with NextAuth using the token
      signIn('credentials', {
        token,
        redirect: false,
      }).then(() => {
        // Redirect to callback URL (original page user tried to access)
        router.push(callbackUrl);
      });
    } else {
      // No token, redirect to login
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-slate-400 text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
