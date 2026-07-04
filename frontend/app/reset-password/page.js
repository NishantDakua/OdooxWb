'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    }
  }, [searchParams]);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  const passwordStrength = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength < 5) {
      setError('Password is too weak. Please satisfy all requirements.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password has been reset successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Reset password failed.');
      }
    } catch (err) {
      setError('Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 border border-emerald-100 text-sm flex items-center gap-2 font-semibold">
          <Check className="w-5 h-5 shrink-0" />
          {success} Redirecting...
        </div>
      )}

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-slate-700 mb-1.5">
          Reset Token
        </label>
        <input
          id="token"
          type="text"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Enter reset token"
        />
      </div>

      <div>
        <label htmlFor="pass" className="block text-sm font-medium text-slate-700 mb-1.5">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            id="pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPass" className="block text-sm font-medium text-slate-700 mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            id="confirmPass"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      {password && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
          <p className="font-semibold text-slate-600">Password Requirements:</p>
          <div className="grid grid-cols-2 gap-2">
            <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Check className="w-3.5 h-3.5" /> 8+ Characters
            </span>
            <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Check className="w-3.5 h-3.5" /> 1 Uppercase Letter
            </span>
            <span className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Check className="w-3.5 h-3.5" /> 1 Lowercase Letter
            </span>
            <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Check className="w-3.5 h-3.5" /> 1 Number
            </span>
            <span className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Check className="w-3.5 h-3.5" /> 1 Special Character (@$!%*?&)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-300 ${
                passwordStrength <= 2 ? 'bg-rose-500' : passwordStrength <= 4 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-xl px-4 py-2.5 font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        Reset Password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <span className="text-xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
            HRMS Portal
          </span>
          <h2 className="text-2xl font-semibold text-slate-900 mt-4">Reset Password</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your token and new password</p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/login" className="text-blue-600 hover:underline font-semibold flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
