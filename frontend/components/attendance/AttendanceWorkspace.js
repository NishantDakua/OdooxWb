'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { AttendanceStats } from './AttendanceStats';
import { CheckInOutActions } from './CheckInOutActions';
import { DailyAttendance } from './DailyAttendance';
import { WeeklyAttendance } from './WeeklyAttendance';
import { AttendanceCalendar } from './AttendanceCalendar';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceHeader } from './AttendanceHeader';
import { fetchJson, deserializeAttendanceSnapshot, deserializeAttendanceRangeSnapshot } from '../../lib/attendance';
import { Loader2 } from 'lucide-react';

export function AttendanceWorkspace({ title = "My Dashboard", description = "Track your attendance, working hours, and schedule." }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        loadData(user.id);
      }
    }
  }, [user, authLoading, router]);

  const loadData = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const [bundle, history] = await Promise.all([
        fetchJson(`/api/attendance/${userId}`, { query: { scope: 'all' } }),
        fetchJson('/api/attendance/history', { query: { userId } }),
      ]);
      
      setData({
        today: deserializeAttendanceSnapshot(bundle.today),
        weekly: deserializeAttendanceRangeSnapshot(bundle.weekly),
        monthly: deserializeAttendanceRangeSnapshot(bundle.monthly),
        history: history.records.map((record) => ({
          ...record,
          date: new Date(record.date),
          checkIn: record.checkIn ? new Date(record.checkIn) : null,
          checkOut: record.checkOut ? new Date(record.checkOut) : null,
        })),
        stats: bundle.stats,
      });
    } catch (err) {
      setError(err.message || 'Unable to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await fetchJson('/api/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      });
      await loadData(user.id);
    } catch (err) {
      setError(err.message || 'Unable to check in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await fetchJson('/api/attendance/checkout', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      });
      await loadData(user.id);
    } catch (err) {
      setError(err.message || 'Unable to check out.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AttendanceHeader title={`Welcome back, ${user.name}`} description={description} />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <AttendanceStats stats={data?.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CheckInOutActions 
              onCheckIn={handleCheckIn} 
              onCheckOut={handleCheckOut} 
              loading={actionLoading} 
              todayRecord={data?.today?.attendance} 
            />
            <WeeklyAttendance records={data?.weekly?.records || []} />
          </div>
          <div className="lg:col-span-1">
            <DailyAttendance record={data?.today?.attendance} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AttendanceCalendar
              month={new Date().getMonth()}
              records={data?.monthly?.records || []}
              onDateSelect={(day, record) => {
                setSelectedDay(day);
                setSelectedRecord(record);
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Date Details</h3>
                {selectedDay ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Selected Date</p>
                      <p className="text-slate-800 font-medium">{selectedDay.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    {selectedRecord ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase">Status</p>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                            selectedRecord.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                            selectedRecord.status === 'ABSENT' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {selectedRecord.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase">Time</p>
                          <p className="text-slate-700 text-sm mt-1">
                            In: {selectedRecord.checkIn ? new Date(selectedRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </p>
                          <p className="text-slate-700 text-sm">
                            Out: {selectedRecord.checkOut ? new Date(selectedRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 pt-2">No attendance logged for this day.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Click any day on the calendar to inspect attendance details.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Recent History</h3>
          <AttendanceTable records={data?.history || []} />
        </div>
      </div>
    </div>
  );
}
