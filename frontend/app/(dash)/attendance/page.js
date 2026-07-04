'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { WeeklyAttendance } from '@/components/attendance/WeeklyAttendance';
import { AttendanceBadge } from '@/components/attendance/AttendanceBadge';
import { EmptyState, ErrorState, SkeletonBlock } from '@/components/shared/states';
import { formatTime, formatHm, workedMinutes, extraMinutes } from '@/lib/format';

function StatCard({ label, value, tone = 'slate' }) {
  const tones = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    rose: 'text-rose-600',
    slate: 'text-slate-900',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();

  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const bundle = await api.get(`/api/attendance/${user.id}`, { scope: 'all' });
      setWeekly(bundle?.weekly?.records || []);
      setMonthly(bundle?.monthly?.records || []);
    } catch (err) {
      setError(err.message || 'Unable to load attendance.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  const counts = monthly.reduce(
    (acc, r) => {
      if (r.status === 'PRESENT') acc.present += 1;
      else if (r.status === 'HALF_DAY') acc.half += 1;
      else if (r.status === 'LEAVE') acc.leave += 1;
      else if (r.status === 'ABSENT') acc.absent += 1;
      return acc;
    },
    { present: 0, half: 0, leave: 0, absent: 0 }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
        <p className="text-slate-500">Your weekly and monthly attendance records.</p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
          </div>
          <SkeletonBlock className="h-48 rounded-2xl" />
          <SkeletonBlock className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary counters (this month) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Days Present" value={counts.present} tone="emerald" />
            <StatCard label="Half Days" value={counts.half} tone="amber" />
            <StatCard label="On Leave" value={counts.leave} tone="blue" />
            <StatCard label="Total Working Days" value={monthly.length} />
          </div>

          <WeeklyAttendance records={weekly} />

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">This Month</h3>
            {monthly.length === 0 ? (
              <EmptyState message="No attendance records this month." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Check In</th>
                      <th className="px-6 py-3">Check Out</th>
                      <th className="px-6 py-3 text-right">Work Hours</th>
                      <th className="px-6 py-3 text-right">Extra Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {monthly.map((r) => (
                      <tr key={r.id}>
                        <td className="px-6 py-3 font-medium text-slate-900">
                          {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-3"><AttendanceBadge status={r.status} /></td>
                        <td className="px-6 py-3 text-slate-600">{r.checkIn ? formatTime(r.checkIn) : '—'}</td>
                        <td className="px-6 py-3 text-slate-600">{r.checkOut ? formatTime(r.checkOut) : '—'}</td>
                        <td className="px-6 py-3 text-right text-slate-700">{formatHm(workedMinutes(r.checkIn, r.checkOut))}</td>
                        <td className="px-6 py-3 text-right text-slate-700">{formatHm(extraMinutes(r.checkIn, r.checkOut))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
