'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const redirectByRole = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();

        if (data.role === 'admin') {
          router.replace('/admin_dashboard');
        } else if (data.role === 'user') {
          router.replace('/user_dashboard');
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    };

    redirectByRole();
  }, [router]); // ✅ Add router as dependency

  return (
    <div className="text-center p-10 text-gray-700">
      Redirecting...
    </div>
  );
}
