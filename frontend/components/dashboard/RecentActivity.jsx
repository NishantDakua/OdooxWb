'use client';

import { CalendarDays, LogIn, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { EmptyState } from '../shared/states';
import { formatDate, formatTime } from '../../lib/format';

// Merge the user's own attendance + leave records into a single, date-sorted feed.
export function buildActivity(attendance = [], leaves = []) {
  const items = [];

  for (const a of attendance) {
    const when = a.checkIn || a.date;
    if (a.checkIn) {
      items.push({
        id: `att-${a.id}`,
        icon: 'in',
        text: `Checked in at ${formatTime(a.checkIn)}`,
        date: a.date,
        ts: new Date(when).getTime(),
      });
    } else {
      items.push({
        id: `att-${a.id}`,
        icon: 'clock',
        text: `Marked ${a.status.replace('_', ' ').toLowerCase()}`,
        date: a.date,
        ts: new Date(when).getTime(),
      });
    }
  }

  for (const l of leaves) {
    const status = l.status;
    const when = l.reviewedAt || l.createdAt || l.startDate;
    let text;
    if (status === 'APPROVED') text = 'Leave approved';
    else if (status === 'REJECTED') text = 'Leave rejected';
    else text = 'Leave requested';
    items.push({
      id: `leave-${l.id}`,
      icon: status.toLowerCase(),
      text: `${text} (${l.type.toLowerCase()})`,
      date: when,
      ts: new Date(when).getTime(),
    });
  }

  return items.sort((a, b) => b.ts - a.ts).slice(0, 5);
}

const ICONS = {
  in: { Icon: LogIn, cls: 'text-emerald-600 bg-emerald-50' },
  clock: { Icon: Clock, cls: 'text-amber-600 bg-amber-50' },
  approved: { Icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
  rejected: { Icon: XCircle, cls: 'text-rose-600 bg-rose-50' },
  pending: { Icon: CalendarDays, cls: 'text-blue-600 bg-blue-50' },
};

export function RecentActivity({ items = [] }) {
  if (items.length === 0) {
    return <EmptyState message="No recent activity." icon={CalendarDays} />;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const { Icon, cls } = ICONS[item.icon] || ICONS.pending;
        return (
          <li key={item.id} className="flex items-center gap-3">
            <span className={`h-9 w-9 rounded-full flex items-center justify-center ${cls}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-800 font-medium truncate">{item.text}</p>
              <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
