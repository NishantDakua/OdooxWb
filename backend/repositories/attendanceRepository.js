const { prisma } = require('../lib/prisma');
const { endOfDay, getMonthRange, getWeekRange, startOfDay } = require('../utils/attendance');

const attendanceSelect = {
  id: true,
  userId: true,
  date: true,
  status: true,
  checkIn: true,
  checkOut: true,
  user: {
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
    },
  },
};

function buildDateFilter(startDate, endDate) {
  if (!startDate && !endDate) {
    return undefined;
  }

  return {
    ...(startDate ? { gte: startOfDay(startDate) } : {}),
    ...(endDate ? { lte: endOfDay(endDate) } : {}),
  };
}

function buildSearchFilter(search) {
  if (!search) {
    return undefined;
  }

  return {
    OR: [
      {
        userId: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        user: {
          is: {
            OR: [
              {
                employeeId: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      },
    ],
  };
}

function buildAttendanceWhere(filters = {}) {
  const where = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const dateFilter = buildDateFilter(filters.startDate, filters.endDate);
  if (dateFilter) {
    where.date = dateFilter;
  }

  const searchFilter = buildSearchFilter(filters.search);
  if (searchFilter) {
    where.AND = searchFilter;
  }

  return where;
}

async function findTodayAttendance(userId, date = new Date()) {
  const normalizedDate = startOfDay(date);

  return prisma.attendance.findFirst({
    where: {
      userId,
      date: {
        gte: normalizedDate,
        lte: endOfDay(normalizedDate),
      },
    },
    select: attendanceSelect,
  });
}

async function createAttendance(data) {
  return prisma.attendance.create({
    data: {
      userId: data.userId,
      date: startOfDay(data.date || new Date()),
      status: data.status,
      checkIn: data.checkIn || new Date(),
      checkOut: data.checkOut || null,
    },
    select: attendanceSelect,
  });
}

async function checkOut(userId, checkOutTime = new Date(), status = 'PRESENT') {
  const todayAttendance = await findTodayAttendance(userId, checkOutTime);

  if (!todayAttendance) {
    return null;
  }

  return prisma.attendance.update({
    where: { id: todayAttendance.id },
    data: { checkOut: checkOutTime, status },
    select: attendanceSelect,
  });
}

async function findWeeklyAttendance(userId, date = new Date()) {
  const { startDate, endDate } = getWeekRange(date);

  return prisma.attendance.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
    select: attendanceSelect,
  });
}

async function findMonthlyAttendance(userId, month, year) {
  const { startDate, endDate } = getMonthRange(month, year);

  return prisma.attendance.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
    select: attendanceSelect,
  });
}

async function findAttendanceHistory(filters = {}) {
  return prisma.attendance.findMany({
    where: buildAttendanceWhere(filters),
    orderBy: [{ date: 'desc' }, { checkIn: 'desc' }],
    select: attendanceSelect,
  });
}

async function findAllAttendance(filters = {}) {
  return prisma.attendance.findMany({
    where: buildAttendanceWhere(filters),
    orderBy: [{ date: 'desc' }, { checkIn: 'desc' }],
    select: attendanceSelect,
  });
}

module.exports = {
  findTodayAttendance,
  createAttendance,
  checkOut,
  findWeeklyAttendance,
  findMonthlyAttendance,
  findAttendanceHistory,
  findAllAttendance,
};
