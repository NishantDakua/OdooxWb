import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';

export function AttendanceCalendar({ month, records, onDateSelect }) {
  const currentDate = new Date(new Date().getFullYear(), month, 1);
  const startDay = startOfWeek(startOfMonth(currentDate));
  const endDay = endOfWeek(endOfMonth(currentDate));
  
  const days = eachDayOfInterval({ start: startDay, end: endDay });

  const getRecordForDate = (date) => {
    return records.find((record) => isSameDay(new Date(record.date), date));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500';
      case 'ABSENT': return 'bg-rose-500';
      case 'HALF_DAY': return 'bg-amber-500';
      case 'LEAVE': return 'bg-blue-500';
      default: return 'bg-transparent';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">{format(currentDate, 'MMMM yyyy')}</h3>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>Present</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>Absent</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>Half Day</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>Leave</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-slate-50 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        {days.map((day, dayIdx) => {
          const record = getRecordForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const today = isToday(day);

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect && onDateSelect(day, record)}
              className={`min-h-[100px] bg-white p-2 flex flex-col items-end justify-between hover:bg-slate-50 transition-colors ${
                !isCurrentMonth ? 'opacity-40 bg-slate-50/50' : ''
              } ${today ? 'bg-blue-50/20' : ''}`}
            >
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                today ? 'bg-blue-600 text-white' : 'text-slate-700'
              }`}>
                {format(day, 'd')}
              </span>
              
              <div className="mt-auto w-full flex flex-col items-center gap-1">
                {record && (
                  <>
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(record.status)}`}></div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      {record.status.replace('_', ' ')}
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
