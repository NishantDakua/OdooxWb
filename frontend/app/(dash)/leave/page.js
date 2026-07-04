'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Send, CalendarDays } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { LeaveStatusBadge } from '@/components/leave/LeaveStatusBadge';
import { ErrorState, EmptyState, SkeletonBlock } from '@/components/shared/states';
import { formatDate } from '@/lib/format';

const LEAVE_TYPES = ['PAID', 'SICK', 'UNPAID'];
const EMPTY_FORM = { type: 'PAID', startDate: '', endDate: '', remarks: '' };

export default function LeavePage() {
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/leaves/me');
      setLeaves(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load your leaves.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    if (!form.startDate || !form.endDate) {
      setFormError('Please select both a start and end date.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/leaves', form);
      setForm(EMPTY_FORM);
      setSuccess('Leave request submitted.');
      await load();
    } catch (err) {
      setFormError(err.message || 'Unable to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leave / Time Off</h1>
        <p className="text-slate-500">Apply for leave and track your requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Apply form */}
        <div className="lg:col-span-1">
          <form onSubmit={submit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Apply for Leave</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Type</label>
              <select
                value={form.type}
                onChange={(e) => change('type', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => change('startDate', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => change('endDate', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Remarks</label>
              <textarea
                value={form.remarks}
                onChange={(e) => change('remarks', e.target.value)}
                rows={3}
                placeholder="Reason for leave (optional)"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white resize-none"
              />
            </div>

            {formError && (
              <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-3 py-2 text-sm">{formError}</div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-3 py-2 text-sm">{success}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Request
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">My Leave Requests</h3>

            {error ? (
              <ErrorState message={error} onRetry={load} />
            ) : loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-14" />
                ))}
              </div>
            ) : leaves.length === 0 ? (
              <EmptyState message="You have not requested any leave yet." icon={CalendarDays} />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">From</th>
                      <th className="px-6 py-3">To</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {leaves.map((l) => (
                      <tr key={l.id}>
                        <td className="px-6 py-3 font-medium text-slate-900">{l.type}</td>
                        <td className="px-6 py-3 text-slate-600">{formatDate(l.startDate)}</td>
                        <td className="px-6 py-3 text-slate-600">{formatDate(l.endDate)}</td>
                        <td className="px-6 py-3"><LeaveStatusBadge status={l.status} /></td>
                        <td className="px-6 py-3 text-slate-500 max-w-xs truncate">{l.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
