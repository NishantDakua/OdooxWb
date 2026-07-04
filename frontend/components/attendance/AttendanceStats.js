import React from 'react';
import { AttendanceCard } from './AttendanceCard';
import { CheckCircle, XCircle, Clock, CalendarDays, Users } from 'lucide-react';

export function AttendanceStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {stats.totalEmployees !== undefined && (
        <AttendanceCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
        />
      )}
      <AttendanceCard
        title="Present"
        value={stats.presentCount || 0}
        icon={CheckCircle}
      />
      <AttendanceCard
        title="Absent"
        value={stats.absentCount || 0}
        icon={XCircle}
      />
      <AttendanceCard
        title="Half Days"
        value={stats.halfDayCount || 0}
        icon={Clock}
      />
      <AttendanceCard
        title="Leaves"
        value={stats.leaveCount || 0}
        icon={CalendarDays}
      />
    </div>
  );
}
