// File: app/(dashboard)/DashboardShell.tsx
'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: Props) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (!data.role) {
          router.push('/login');
          return;
        }

        setRole(data.role);
      } catch (err) {
        console.error('Error verifying auth:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading || !role) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-light-gray">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
