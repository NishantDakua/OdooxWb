'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X, Loader2, CalendarDays } from 'lucide-react';
import { api } from '../../lib/api';
import { ErrorState, EmptyState, SkeletonBlock } from '../shared/states';
import { formatDate } from '../../lib/format';

export function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [comments, setComments] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/leaves', { status: 'PENDING' });
      setLeaves(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load pending leaves.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id, status) => {
    setActingId(id);
    setActionError('');
    try {
      await api.patch(`/api/leaves/${id}/status`, { status, adminComment: comments[id] || '' });
      await load();
    } catch (err) {
      setActionError(err.message || 'Unable to update leave.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {actionError && <ErrorState message={actionError} onRetry={() => setActionError('')} />}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState message="No pending leave requests." icon={CalendarDays} />
      ) : (
        <div className="space-y-3">
          {leaves.map((l) => {
            const busy = actingId === l.id;
            return (
              <div key={l.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{l.requester?.name || '—'}</p>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{l.type}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(l.startDate)} → {formatDate(l.endDate)}
                    </p>
                    {l.remarks && <p className="text-sm text-slate-400 mt-1 truncate">{l.remarks}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => review(l.id, 'APPROVED')}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => review(l.id, 'REJECTED')}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={comments[l.id] || ''}
                  onChange={(e) => setComments((prev) => ({ ...prev, [l.id]: e.target.value }))}
                  placeholder="Add a comment (optional) — sent with approve/reject"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
