'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { User, CalendarCheck, CalendarDays, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { CheckInOutActions } from '@/components/attendance/CheckInOutActions';
import { WeeklyAttendance } from '@/components/attendance/WeeklyAttendance';
import { RecentActivity, buildActivity } from '@/components/dashboard/RecentActivity';
import { ErrorState, SkeletonBlock, SkeletonCard } from '@/components/shared/states';

const QUICK = [
  { href: '/profile', label: 'Profile', desc: 'View & edit your details', icon: User },
  { href: '/attendance', label: 'Attendance', desc: 'Your attendance history', icon: CalendarCheck },
  { href: '/leave', label: 'Leave Requests', desc: 'Apply & track time off', icon: CalendarDays },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [bundle, leaves] = await Promise.all([
        api.get(`/api/attendance/${user.id}`, { scope: 'all' }),
        api.get('/api/leaves/me'),
      ]);
      setToday(bundle?.today?.attendance || null);
      setWeekly(bundle?.weekly?.records || []);
      setActivity(buildActivity(bundle?.monthly?.records || [], leaves || []));
    } catch (err) {
      setError(err.message || 'Unable to load your dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.post('/api/attendance/checkin', { userId: user.id });
      await load();
    } catch (err) {
      setActionError(err.message || 'Unable to check in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.post('/api/attendance/checkout', { userId: user.id });
      await load();
    } catch (err) {
      setActionError(err.message || 'Unable to check out.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h1>
        <p className="text-slate-500">Here is what is happening with your work today.</p>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{q.label}</p>
                  <p className="text-xs text-slate-500">{q.desc}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          );
        })}
      </div>

      {actionError && <ErrorState message={actionError} onRetry={() => setActionError('')} />}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SkeletonCard />
            <SkeletonCard className="h-64" />
          </div>
          <SkeletonCard className="h-64" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Preserved Check-In/Check-Out card */}
            <CheckInOutActions
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              loading={actionLoading}
              todayRecord={today}
            />
            {/* Preserved weekly attendance summary card */}
            <WeeklyAttendance records={weekly} />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
              <RecentActivity items={activity} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
