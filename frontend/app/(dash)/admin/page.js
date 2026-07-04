'use client';

import { useState } from 'react';
import { Users, CalendarCheck, CalendarClock, ShieldAlert } from 'lucide-react';
import { RoleGate } from '@/components/auth/RoleGate';
import { EmployeeGrid } from '@/components/admin/EmployeeGrid';
import { AttendanceRecords } from '@/components/admin/AttendanceRecords';
import { LeaveApprovals } from '@/components/admin/LeaveApprovals';

const TABS = [
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
  { key: 'leaves', label: 'Leave Approvals', icon: CalendarClock },
];

function AdminPanel() {
  const [tab, setTab] = useState('employees');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-slate-500">Manage employees, attendance and leave requests.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div>
        {tab === 'employees' && <EmployeeGrid />}
        {tab === 'attendance' && <AttendanceRecords />}
        {tab === 'leaves' && <LeaveApprovals />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGate
      roles={['ADMIN', 'HR']}
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">You do not have access to the Admin Panel.</p>
        </div>
      }
    >
      <AdminPanel />
    </RoleGate>
  );
}
