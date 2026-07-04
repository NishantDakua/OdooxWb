'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Your email has been verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Email verification failed.');
      }
    } catch (err) {
      setError('Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm flex items-center gap-2 justify-center">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 border border-emerald-100 text-sm flex items-center gap-2 justify-center font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {success} Redirecting...
        </div>
      )}

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
          Verification Token
        </label>
        <input
          id="token"
          type="text"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Enter verification token"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-xl px-4 py-2.5 font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        Verify Account
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 animate-bounce" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Email Verification</h2>
          <p className="text-slate-500 text-sm mt-1">Verify your account with the token received</p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }>
          <VerifyEmailForm />
        </Suspense>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
