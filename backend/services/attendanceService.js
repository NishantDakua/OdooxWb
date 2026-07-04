const repository = require('../repositories/attendanceRepository');
const { formatWorkingHours, getMonthRange, getWeekRange } = require('../utils/attendance');

class AttendanceServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AttendanceServiceError';
    this.statusCode = statusCode;
  }
}

function calculateWorkingHours(checkIn, checkOut) {
  return formatWorkingHours(checkIn, checkOut);
}

async function checkIn(input) {
  const existingAttendance = await repository.findTodayAttendance(input.userId);

  if (existingAttendance) {
    throw new AttendanceServiceError('You have already checked in for today.', 409);
  }

  return repository.createAttendance({
    userId: input.userId,
    date: new Date(),
    status: 'PRESENT',
    checkIn: new Date(),
    checkOut: null,
  });
}

async function checkOut(input) {
  const todayAttendance = await repository.findTodayAttendance(input.userId);

  if (!todayAttendance) {
    throw new AttendanceServiceError('Cannot check out before checking in.', 400);
  }

  if (!todayAttendance.checkIn) {
    throw new AttendanceServiceError('Cannot check out before checking in.', 400);
  }

  if (todayAttendance.checkOut) {
    throw new AttendanceServiceError('You have already checked out for today.', 409);
  }

  const checkOutTime = new Date();
  const { totalMinutes } = calculateWorkingHours(todayAttendance.checkIn, checkOutTime);
  let status = 'PRESENT';
  if (totalMinutes < 4 * 60) {
    status = 'HALF_DAY';
  }

  const updatedAttendance = await repository.checkOut(input.userId, checkOutTime, status);

  if (!updatedAttendance) {
    throw new AttendanceServiceError('Unable to update today\'s attendance.', 500);
  }

  return {
    attendance: updatedAttendance,
    workingHours: calculateWorkingHours(updatedAttendance.checkIn, updatedAttendance.checkOut),
  };
}

async function getTodayAttendance(userId, date = new Date()) {
  const attendance = await repository.findTodayAttendance(userId, date);
  return {
    attendance,
    workingHours: calculateWorkingHours(attendance?.checkIn || null, attendance?.checkOut || null),
  };
}

async function getWeeklyAttendance(userId, date = new Date()) {
  const { startDate, endDate } = getWeekRange(date);
  const records = await repository.findWeeklyAttendance(userId, date);
  return { records, startDate, endDate };
}

async function getMonthlyAttendance(userId, month, year) {
  const { startDate, endDate } = getMonthRange(month, year);
  const records = await repository.findMonthlyAttendance(userId, month, year);
  return { records, startDate, endDate };
}

async function getAttendanceHistory(filters = {}) {
  return repository.findAttendanceHistory(filters);
}

async function getAdminAttendance(filters = {}) {
  const records = await repository.findAllAttendance(filters);
  const stats = await getAttendanceStats(filters);
  return { records, stats };
}

async function getAttendanceStats(filters = {}) {
  const records = await repository.findAllAttendance(filters);

  const uniqueEmployees = new Set();
  const stats = {
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    halfDayCount: 0,
    leaveCount: 0,
  };

  for (const record of records) {
    uniqueEmployees.add(record.userId);

    if (record.status === 'PRESENT') stats.presentCount += 1;
    if (record.status === 'ABSENT') stats.absentCount += 1;
    if (record.status === 'HALF_DAY') stats.halfDayCount += 1;
    if (record.status === 'LEAVE') stats.leaveCount += 1;
  }

  stats.totalEmployees = uniqueEmployees.size;
  return stats;
}

module.exports = {
  AttendanceServiceError,
  calculateWorkingHours,
  checkIn,
  checkOut,
  getTodayAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getAttendanceHistory,
  getAdminAttendance,
  getAttendanceStats,
};
