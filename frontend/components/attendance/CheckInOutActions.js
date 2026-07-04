import React from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export function CheckInOutActions({ onCheckIn, onCheckOut, loading, todayRecord }) {
  const isCheckedIn = Boolean(todayRecord);
  const isCheckedOut = Boolean(todayRecord?.checkOut);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors duration-300 ${isCheckedIn && !isCheckedOut ? 'bg-emerald-500' : isCheckedOut ? 'bg-slate-400' : 'bg-blue-600'}`}>
            {isCheckedIn && !isCheckedOut ? (
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </span>
            ) : (
              <ClockIcon className="w-6 h-6" />
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {isCheckedIn && !isCheckedOut ? 'Currently Checked In' : isCheckedOut ? 'Checked Out' : 'Not Checked In'}
          </h3>
          <p className="text-slate-500 text-sm">
            {todayRecord?.checkIn ? `Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready to start your day?'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={onCheckIn}
          disabled={loading || isCheckedIn}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && !isCheckedIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
          Check In
        </button>
        <button
          onClick={onCheckOut}
          disabled={loading || !isCheckedIn || isCheckedOut}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && isCheckedIn && !isCheckedOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
          Check Out
        </button>
      </div>
    </div>
  );
}

function ClockIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}
