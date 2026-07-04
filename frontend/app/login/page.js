'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';
import { LogIn, Lock, Mail, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [employeeIdOrEmail, setEmployeeIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  // If already logged in, redirect home
  useEffect(() => {
    if (user) {
      if (user.isFirstLogin) {
        router.replace('/change-password');
      } else {
        router.replace(user.role === 'ADMIN' || user.role === 'HR' ? '/admin/attendance' : '/attendance');
      }
    }
  }, [user, router]);

  // Load remember me email/ID
  useEffect(() => {
    const savedId = localStorage.getItem('remembered_user');
    if (savedId) {
      setEmployeeIdOrEmail(savedId);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeIdOrEmail, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (rememberMe) {
          localStorage.setItem('remembered_user', employeeIdOrEmail);
        } else {
          localStorage.removeItem('remembered_user');
        }

        login(data.token, data.user);
        if (data.mustChangePassword) {
          router.push('/change-password');
        } else {
          router.push(data.user.role === 'ADMIN' || data.user.role === 'HR' ? '/admin/attendance' : '/attendance');
        }
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <span className="text-xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
            HRMS Portal
          </span>
          <h2 className="text-2xl font-semibold text-slate-900 mt-4">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your credentials to sign in</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm flex items-center gap-2">
            <Lock className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-slate-700 mb-1.5">
              Employee ID or Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="userId"
                type="text"
                value={employeeIdOrEmail}
                onChange={(e) => setEmployeeIdOrEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. EMP101 or john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="pass" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="pass"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600 font-medium">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl px-4 py-2.5 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
