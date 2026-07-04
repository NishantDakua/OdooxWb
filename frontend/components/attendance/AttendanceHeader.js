import React from 'react';

export function AttendanceHeader({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      {description && <p className="text-slate-500 mt-2">{description}</p>}
    </div>
  );
}
