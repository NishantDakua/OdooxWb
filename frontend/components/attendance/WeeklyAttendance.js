import React from 'react';
import { AttendanceTable } from './AttendanceTable';

export function WeeklyAttendance({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center shadow-sm">
        <p className="text-slate-500">No attendance records found for this week.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Summary</h3>
      <AttendanceTable records={records} />
    </div>
  );
}
