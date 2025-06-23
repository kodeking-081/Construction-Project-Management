// File: app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage({ text: 'Please fill out both fields.', type: 'error' });
      return;
    }

    setMessage({ text: 'Attempting to log in...', type: 'info' });

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorText = await res.text(); // 🌟 use text() safely here
        console.error('❌ Login failed:', errorText);
        setMessage({ text: 'Login failed: Invalid credentials', type: 'error' });
        return;
      }

      const data = await res.json(); // ✅ now safe
      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

      setTimeout(() => {
        if (data.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }, 200);
    } catch (err) {
      console.error('🚨 Unexpected error:', err);
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    }
  };



  return (
    <div className="flex flex-col md:flex-row min-h-screen font-[Inter]">
      <div
        className="md:w-1/2 lg:w-3/5 hidden md:flex flex-col justify-center items-center text-white relative bg-cover bg-center p-12"
        
      >
        <div className="absolute inset-0 bg-slate-800 opacity-60" />
        <div className="relative z-10 text-center max-w-2xl">
          <svg className="mx-auto h-16 w-auto mb-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
          </svg>
          <h1 className="text-5xl font-bold mb-4">Construction Progress Tracker</h1>
          <p className="text-xl text-gray-200">Efficiently manage and monitor your projects from foundation to finish.</p>
        </div>
        <div className="absolute bottom-8 text-sm text-gray-300">&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <svg className="md:hidden mx-auto h-12 w-auto mb-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-600">Log in to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input rounded-md w-full px-4 py-3 border border-gray-300 text-gray-900"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input rounded-md w-full px-4 py-3 border border-gray-300 text-gray-900"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {message && (
              <p className={`text-sm text-center ${
                message.type === 'error' ? 'text-red-600' :
                message.type === 'success' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {message.text}
              </p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-900">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-600" />
                Remember me
              </label>
              <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
