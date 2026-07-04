import React from 'react';

export function AttendanceCard({ title, value, icon: Icon, description }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        {Icon && <div className="text-blue-500 bg-blue-50 p-2 rounded-xl"><Icon size={20} /></div>}
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
      </div>
    </div>
  );
}
