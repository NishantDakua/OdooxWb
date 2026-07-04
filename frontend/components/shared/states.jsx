'use client';

import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

// Visible error with a retry button — never swallow failures.
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
      <p className="text-red-700 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'Nothing here yet.', icon: Icon = Inbox }) {
  return (
    <div className="text-center py-10 px-6">
      <Icon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}

// Simple animated skeleton block.
export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm ${className}`}>
      <SkeletonBlock className="h-4 w-1/3 mb-4" />
      <SkeletonBlock className="h-3 w-2/3 mb-2" />
      <SkeletonBlock className="h-3 w-1/2" />
    </div>
  );
}
