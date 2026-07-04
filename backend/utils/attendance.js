function startOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function endOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

function getWeekRange(date) {
  const current = startOfDay(date);
  const dayIndex = current.getDay();
  const startDate = new Date(current);
  startDate.setDate(current.getDate() - dayIndex);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return { startDate: startOfDay(startDate), endDate: endOfDay(endDate) };
}

function getMonthRange(month, year) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return { startDate: startOfDay(startDate), endDate: endOfDay(endDate) };
}

function calculateWorkingMinutes(checkIn, checkOut) {
  return Math.max(Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000), 0);
}

function formatWorkingHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return { totalMinutes: 0, hours: 0, minutes: 0, formatted: '0h 0m' };
  }

  const totalMinutes = calculateWorkingMinutes(checkIn, checkOut);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { totalMinutes, hours, minutes, formatted: `${hours}h ${minutes}m` };
}

module.exports = {
  startOfDay,
  endOfDay,
  getWeekRange,
  getMonthRange,
  calculateWorkingMinutes,
  formatWorkingHours,
};
