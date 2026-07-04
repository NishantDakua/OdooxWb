'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { AttendanceStats } from './AttendanceStats';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceCalendar } from './AttendanceCalendar';
import { AttendanceHeader } from './AttendanceHeader';
import { fetchJson, deserializeAttendanceRangeSnapshot } from '../../lib/attendance';
import { Search, Download, Filter, Loader2 } from 'lucide-react';

function getStartEndForDate(dateString) {
  if (!dateString) return {};
  const date = new Date(dateString);
  return { startDate: date.toISOString(), endDate: date.toISOString() };
}

export function AdminAttendanceWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push(user ? '/attendance' : '/login');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchJson('/api/admin/attendance', { query: filters });
      setData({
        records: deserializeAttendanceRangeSnapshot({
          records: payload.records,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        }).records,
        stats: payload.stats,
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load admin attendance data.');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data?.records || data.records.length === 0) return;
    
    const headers = ['Date', 'Employee ID', 'Name', 'Status', 'Check In', 'Check Out'];
    const csvContent = [
      headers.join(','),
      ...data.records.map(r => {
        return [
          new Date(r.date).toLocaleDateString(),
          r.user?.employeeId || '-',
          r.user?.name || '-',
          r.status,
          r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-',
          r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (authLoading || (loading && !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <AttendanceHeader title="Admin Dashboard" description="Overview of all employee attendance records." />
        <button 
          onClick={exportCSV}
          disabled={!data?.records?.length}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
              />
            </div>
            <button
              onClick={() => loadData({ search, ...getStartEndForDate(dateFilter) })}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Filter size={18} />}
              Filter
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {data?.stats && <AttendanceStats stats={data.stats} />}

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Attendance Records</h3>
          {data?.records?.length > 0 ? (
            <AttendanceTable records={data.records} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              No attendance records found matching your filters.
            </div>
          )}
        </div>

        {data?.records?.length > 0 && (
          <AttendanceCalendar
            month={new Date().getMonth()}
            records={data.records}
            onDateSelect={() => {}}
          />
        )}
      </div>
    </main>
  );
}
