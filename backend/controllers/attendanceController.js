const service = require('../services/attendanceService');
const repository = require('../repositories/attendanceRepository');
const {
  attendanceCheckInSchema,
  attendanceCheckOutSchema,
  attendanceHistoryQuerySchema,
  attendanceStatusSchema,
  dateSchema,
  uuidSchema,
} = require('../validators/attendance');

function getQueryParam(searchParams, key) {
  const value = searchParams.get(key);
  return value && value.trim().length > 0 ? value : null;
}

function ensureAuthorized(req, targetUserId) {
  if (req.user.role !== 'ADMIN' && req.user.userId !== targetUserId) {
    throw new service.AttendanceServiceError('Forbidden. You can only access your own records.', 403);
  }
}

function getOptionalDate(searchParams, key) {
  const value = getQueryParam(searchParams, key);
  if (!value) return undefined;
  return dateSchema.parse(value);
}

function getOptionalNumber(searchParams, key) {
  const value = getQueryParam(searchParams, key);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function sendError(res, error) {
  if (error instanceof service.AttendanceServiceError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  if (error instanceof Error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
}

async function buildAttendancePayload(userId, date, month, year, scope = 'all') {
  if (scope === 'today') {
    return {
      data: await service.getTodayAttendance(userId, date),
    };
  }

  if (scope === 'weekly') {
    return {
      data: await service.getWeeklyAttendance(userId, date),
    };
  }

  if (scope === 'monthly') {
    return {
      data: await service.getMonthlyAttendance(userId, month, year),
    };
  }

  const [today, weekly, monthly, stats] = await Promise.all([
    service.getTodayAttendance(userId, date),
    service.getWeeklyAttendance(userId, date),
    service.getMonthlyAttendance(userId, month, year),
    service.getAttendanceStats({ userId }),
  ]);

  return {
    data: {
      today,
      weekly,
      monthly,
      stats,
    },
  };
}

async function checkIn(req, res) {
  try {
    const payload = attendanceCheckInSchema.parse(req.body);
    ensureAuthorized(req, payload.userId);
    const attendance = await service.checkIn(payload);
    return res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    return sendError(res, error);
  }
}

async function checkOut(req, res) {
  try {
    const payload = attendanceCheckOutSchema.parse(req.body);
    ensureAuthorized(req, payload.userId);
    const result = await service.checkOut(payload);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAttendance(req, res) {
  try {
    const searchParams = new URL(req.url, 'http://localhost').searchParams;
    const userId = uuidSchema.parse(getQueryParam(searchParams, 'userId'));
    ensureAuthorized(req, userId);
    const scope = getQueryParam(searchParams, 'scope') || 'all';
    const date = getOptionalDate(searchParams, 'date') || new Date();
    const month = getOptionalNumber(searchParams, 'month') ?? date.getMonth();
    const year = getOptionalNumber(searchParams, 'year') ?? date.getFullYear();
    const payload = await buildAttendancePayload(userId, date, month, year, scope);
    return res.json({ success: true, ...payload });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAttendanceByUserId(req, res) {
  try {
    const userId = uuidSchema.parse(req.params.userId);
    ensureAuthorized(req, userId);
    const searchParams = new URL(req.url, 'http://localhost').searchParams;
    const scope = getQueryParam(searchParams, 'scope') || 'all';
    const date = getOptionalDate(searchParams, 'date') || new Date();
    const month = getOptionalNumber(searchParams, 'month') ?? date.getMonth();
    const year = getOptionalNumber(searchParams, 'year') ?? date.getFullYear();

    const payload = await buildAttendancePayload(userId, date, month, year, scope);
    return res.json({ success: true, ...payload });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getHistory(req, res) {
  try {
    const searchParams = new URL(req.url, 'http://localhost').searchParams;
    const requestedUserId = getQueryParam(searchParams, 'userId');
    if (requestedUserId) {
      ensureAuthorized(req, requestedUserId);
    } else if (req.user.role !== 'ADMIN') {
      throw new service.AttendanceServiceError('Forbidden. You must specify your userId.', 403);
    }
    
    const query = attendanceHistoryQuerySchema.parse({
      userId: requestedUserId || undefined,
      status: getQueryParam(searchParams, 'status') || undefined,
      search: getQueryParam(searchParams, 'search') || undefined,
      startDate: getOptionalDate(searchParams, 'startDate'),
      endDate: getOptionalDate(searchParams, 'endDate'),
    });

    const [records, stats] = await Promise.all([
      service.getAttendanceHistory(query),
      service.getAttendanceStats(query),
    ]);

    return res.json({ success: true, data: { records, stats } });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAdminAttendance(req, res) {
  try {
    const searchParams = new URL(req.url, 'http://localhost').searchParams;
    const query = attendanceHistoryQuerySchema.parse({
      userId: getQueryParam(searchParams, 'userId') || undefined,
      status: getQueryParam(searchParams, 'status') || undefined,
      search: getQueryParam(searchParams, 'search') || undefined,
      startDate: getOptionalDate(searchParams, 'startDate'),
      endDate: getOptionalDate(searchParams, 'endDate'),
    });

    const result = await service.getAdminAttendance(query);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
  getAttendanceByUserId,
  getHistory,
  getAdminAttendance,
};
