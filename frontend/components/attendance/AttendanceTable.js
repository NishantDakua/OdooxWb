import React from 'react';
import { AttendanceBadge } from './AttendanceBadge';
import { formatTime, formatWorkingHours } from '../../lib/attendance';

export function AttendanceTable({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
          <tr>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Check In</th>
            <th className="px-6 py-4">Check Out</th>
            <th className="px-6 py-4 text-right">Hours</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">
                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </td>
              <td className="px-6 py-4">
                <AttendanceBadge status={record.status} />
              </td>
              <td className="px-6 py-4 text-slate-600">
                {record.checkIn ? formatTime(new Date(record.checkIn)) : '-'}
              </td>
              <td className="px-6 py-4 text-slate-600">
                {record.checkOut ? formatTime(new Date(record.checkOut)) : '-'}
              </td>
              <td className="px-6 py-4 text-right font-medium text-slate-700">
                {record.checkIn && record.checkOut ? formatWorkingHours(new Date(record.checkIn), new Date(record.checkOut)) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
