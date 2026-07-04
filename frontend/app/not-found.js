'use client';

import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 text-sm mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link
          href={user ? (user.role === 'ADMIN' ? '/admin/attendance' : '/attendance') : '/login'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safety
        </Link>
      </div>
    </div>
  );
}
