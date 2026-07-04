'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Plane, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { initials } from '../../lib/format';
import { ErrorState, EmptyState, SkeletonCard } from '../shared/states';
import { Modal } from '../shared/Modal';
import { ProfileView } from '../profile/ProfileView';

function StatusDot({ employee }) {
  // Priority: on approved leave today > present+checked-in > no attendance.
  if (employee.onLeaveToday) {
    return (
      <span title="On leave today" className="h-6 w-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
        <Plane className="w-3.5 h-3.5" />
      </span>
    );
  }
  const att = employee.todayAttendance;
  if (att?.status === 'PRESENT' && att?.checkIn) {
    return <span title="Present today" className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />;
  }
  return <span title="No attendance today" className="h-3 w-3 rounded-full bg-amber-400 ring-4 ring-amber-100" />;
}

export function EmployeeGrid() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/users');
      setEmployees(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = employees.filter((e) =>
    (e.name || '').toLowerCase().includes(search.trim().toLowerCase())
  );

  const selected = employees.find((e) => e.id === selectedId) || null;

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees by name..."
          className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState message={search ? 'No employees match your search.' : 'No employees found.'} icon={Users} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className="text-left bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="relative shrink-0">
                {e.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.profilePicture} alt={e.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {initials(e.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{e.name || '—'}</p>
                <p className="text-xs text-slate-500 truncate">{e.jobTitle || '—'}</p>
              </div>
              <StatusDot employee={e} />
            </button>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelectedId(null)} title={selected?.name || 'Employee'} wide>
        {selected && <ProfileView userId={selected.id} isReadOnly />}
      </Modal>
    </div>
  );
}
