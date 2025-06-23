// File: components/Sidebar.tsx
// File: components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Sidebar({ role }: { role: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const NavItems = () => (
    <>
      <Link href={role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-yellow-500 rounded-lg">
        🏠 Dashboard
      </Link>
      <Link href="/projects" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-yellow-500 rounded-lg">
        📁 Projects
      </Link>
      <Link href="/tasks" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-yellow-500 rounded-lg">
        ✅ Tasks
      </Link>
      {role === 'ADMIN' && (
        <Link href="/costboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-yellow-500 rounded-lg">
          💰 Cost Board
        </Link>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Header & Menu */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" />
            </svg>
            <span className="text-lg font-bold">ConstructCo</span>
          </div>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {isOpen && (
          <div className="px-4 pb-4 space-y-2">
            {NavItems()}
            <button onClick={handleLogout} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 bg-white text-gray-900 border-r border-gray-200 flex-col justify-between">
        <div>
          <div className="flex items-center justify-center h-20 border-b border-gray-200">
            <svg className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <h1 className="ml-3 text-2xl font-montserrat">ConstructCo</h1>
          </div>
          <div className="mt-6 px-4 space-y-2">{NavItems()}</div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-red-700 text-white rounded-lg transition">
            🚪 Logout
          </button>
        </div>
      </nav>
    </>
  );
}


