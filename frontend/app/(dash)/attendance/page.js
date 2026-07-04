'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { WeeklyAttendance } from '@/components/attendance/WeeklyAttendance';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { ErrorState, SkeletonBlock } from '@/components/shared/states';

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
          <SkeletonBlock className="h-48 rounded-2xl" />
          <SkeletonBlock className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-8">
          <WeeklyAttendance records={weekly} />
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">This Month</h3>
            <AttendanceTable records={monthly} />
          </div>
        </div>
      )}
    </div>
  );
}
