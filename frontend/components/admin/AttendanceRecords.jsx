'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { AttendanceBadge } from '../attendance/AttendanceBadge';
import { ErrorState, EmptyState, SkeletonBlock } from '../shared/states';
import { formatTime, formatHm, workedMinutes, extraMinutes } from '../../lib/format';

function todayInput() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function AttendanceRecords() {
  const [date, setDate] = useState(todayInput());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Today's attendance across all employees, filtered to the chosen date.
      const data = await api.get('/api/admin/attendance', { startDate: date, endDate: date });
      setRecords(data?.records || []);
    } catch (err) {
      setError(err.message || 'Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} className="h-14" />)}
        </div>
      ) : records.length === 0 ? (
        <EmptyState message="No attendance records for this date." icon={CalendarCheck} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3 text-right">Work Hours</th>
                <th className="px-6 py-3 text-right">Extra Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3">
                    <p className="font-medium text-slate-900">{r.user?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{r.user?.employeeId || ''}</p>
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
  );
}
