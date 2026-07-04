'use client';

import { useState } from 'react';
import Link from 'next/navigation';
import { Mail, ArrowLeft, Loader2, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockToken, setMockToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password reset link simulated successfully.');
        setMockToken(data.mockToken);
      } else {
        setError(data.message || 'Forgot password request failed.');
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
          <h2 className="text-2xl font-semibold text-slate-900 mt-4">Forgot Password?</h2>
          <p className="text-slate-500 text-sm mt-1 text-center">
            No worries, we will simulate sending you a reset link.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 border border-emerald-100 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Check className="w-5 h-5 shrink-0" />
              {success}
            </div>
            {mockToken && (
              <div className="bg-white p-3 rounded-lg border border-emerald-200 mt-2">
                <p className="text-xs text-slate-500">Your reset token (Mocked for Hackathon):</p>
                <code className="text-sm font-mono block select-all mt-1 bg-slate-50 p-1.5 rounded text-blue-600 font-bold">{mockToken}</code>
                <a href={`/reset-password?token=${mockToken}`} className="text-xs text-blue-600 hover:underline mt-2 inline-block font-medium">
                  Go to Password Reset page &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl px-4 py-2.5 font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <a href="/login" className="text-blue-600 hover:underline font-semibold flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
