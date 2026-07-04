const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];

export function buildApiUrl(path, query = {}) {
  const url = new URL(path, API_BASE_URL);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export async function fetchJson(path, options = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const response = await fetch(buildApiUrl(path, options.query), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to load attendance data.');
  }

  return payload.data;
}

export function toDate(value) {
  return value ? new Date(value) : null;
}

export function deserializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
  };
}

export function deserializeAttendanceRecord(record) {
  return {
    ...record,
    date: new Date(record.date),
    checkIn: toDate(record.checkIn),
    checkOut: toDate(record.checkOut),
    user: deserializeUser(record.user),
  };
}

export function deserializeAttendanceSnapshot(snapshot) {
  return {
    attendance: snapshot.attendance ? deserializeAttendanceRecord(snapshot.attendance) : null,
    workingHours: snapshot.workingHours,
  };
}

export function deserializeAttendanceRangeSnapshot(snapshot) {
  return {
    records: snapshot.records.map(deserializeAttendanceRecord),
    startDate: new Date(snapshot.startDate),
    endDate: new Date(snapshot.endDate),
  };
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(date) {
  return date
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    : '-';
}

export function formatWorkingHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return '0h 0m';
  }

  const totalMinutes = Math.max(Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function getStatusTone(status) {
  switch (status) {
    case 'PRESENT':
      return 'blue1';
    case 'HALF_DAY':
      return 'blue2';
    case 'LEAVE':
      return 'blue3';
    case 'ABSENT':
    default:
      return 'blue4';
  }
}

export function getStatusLabel(status) {
  return status.replace('_', ' ');
}

export function getWeekRange(date) {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const dayIndex = current.getDay();
  const startDate = new Date(current);
  startDate.setDate(current.getDate() - dayIndex);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return { startDate, endDate };
}

export function getMonthRange(month, year) {
  return {
    startDate: new Date(year, month, 1),
    endDate: new Date(year, month + 1, 0),
  };
}

export function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}
