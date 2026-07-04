import React from 'react';
import { AttendanceBadge } from './AttendanceBadge';
import { Clock, Calendar, Coffee } from 'lucide-react';
import { formatTime } from '../../lib/attendance';

export function DailyAttendance({ record }) {
  if (!record) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Today's Details</h3>
        <AttendanceBadge status={record.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
          <div className="text-emerald-500 bg-emerald-100 p-3 rounded-xl"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-slate-500">Check In</p>
            <p className="font-semibold text-slate-900">{record.checkIn ? formatTime(new Date(record.checkIn)) : '--:--'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
          <div className="text-blue-500 bg-blue-100 p-3 rounded-xl"><Coffee size={24} /></div>
          <div>
            <p className="text-sm text-slate-500">Check Out</p>
            <p className="font-semibold text-slate-900">{record.checkOut ? formatTime(new Date(record.checkOut)) : '--:--'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
          <div className="text-indigo-500 bg-indigo-100 p-3 rounded-xl"><Calendar size={24} /></div>
          <div>
            <p className="text-sm text-slate-500">Date</p>
            <p className="font-semibold text-slate-900">{new Date(record.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
