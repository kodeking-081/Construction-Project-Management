// File: components/Header.tsx
'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="md:hidden bg-white border-b sticky top-0 z-50">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Mobile Logo */}
        <div className="flex items-center space-x-2">
          <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-lg font-bold text-yellow-700">ConstructCo</span>
        </div>

        {/* Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2">
          <Link href="/admin/dashboard" className="block text-gray-800 hover:text-yellow-500">🏠 Dashboard</Link>
          <Link href="/projects" className="block text-gray-800 hover:text-yellow-500">📁 Projects</Link>
          <Link href="/tasks" className="block text-gray-800 hover:text-yellow-500">✅ Tasks</Link>
          <Link href="/costboard" className="block text-gray-800 hover:text-yellow-500">💰 Cost Board</Link>
          <button onClick={handleLogout} className="w-full text-left text-red-600 hover:text-red-700">🚪 Logout</button>
        </div>
      )}
    </header>
  );
}
