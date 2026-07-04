import React from 'react';

export function AttendanceBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ABSENT':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'HALF_DAY':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LEAVE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const label = status ? status.replace('_', ' ') : 'UNKNOWN';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      {label}
    </span>
  );
}
