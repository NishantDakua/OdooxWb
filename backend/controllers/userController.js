const { prisma } = require('../lib/prisma');

// Public-safe fields (never expose passwordHash / tokens).
const userSelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  role: true,
  department: true,
  jobTitle: true,
  phone: true,
  address: true,
  dateOfBirth: true,
  residingAddress: true,
  nationality: true,
  personalEmail: true,
  gender: true,
  maritalStatus: true,
  bankAccountNumber: true,
  bankName: true,
  ifscCode: true,
  panNumber: true,
  uanNumber: true,
  profilePicture: true,
  joiningDate: true,
  isFirstLogin: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

// Fields the owner (or ADMIN/HR) may edit via private-info.
const editableFields = [
  'phone',
  'address',
  'dateOfBirth',
  'residingAddress',
  'nationality',
  'personalEmail',
  'gender',
  'maritalStatus',
  'joiningDate',
  'bankAccountNumber',
  'bankName',
  'ifscCode',
  'panNumber',
  'uanNumber',
];
const dateFields = new Set(['dateOfBirth', 'joiningDate']);

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function canViewOrEdit(req, targetUserId) {
  return (
    req.user.role === 'ADMIN' ||
    req.user.role === 'HR' ||
    req.user.userId === targetUserId
  );
}

// GET /api/users  (ADMIN/HR) — list all employees with today's status signals.
async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: userSelect,
    });

    const [todayAttendance, approvedLeavesToday] = await Promise.all([
      prisma.attendance.findMany({
        where: { date: { gte: startOfToday(), lte: endOfToday() } },
        select: { userId: true, status: true, checkIn: true },
      }),
      prisma.leave.findMany({
        where: {
          status: 'APPROVED',
          startDate: { lte: endOfToday() },
          endDate: { gte: startOfToday() },
        },
        select: { userId: true },
      }),
    ]);

    const attByUser = new Map(todayAttendance.map((a) => [a.userId, a]));
    const onLeave = new Set(approvedLeavesToday.map((l) => l.userId));

    const data = users.map((u) => {
      const att = attByUser.get(u.id) || null;
      return {
        ...u,
        todayAttendance: att,
        onLeaveToday: onLeave.has(u.id),
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// GET /api/users/:id  (owner or ADMIN/HR) — full profile.
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    if (!canViewOrEdit(req, id)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// PUT /api/users/:id/private-info  (owner or ADMIN/HR)
async function updatePrivateInfo(req, res, next) {
  try {
    const { id } = req.params;
    if (!canViewOrEdit(req, id)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const data = {};
    for (const field of editableFields) {
      if (!(field in req.body)) continue;
      const value = req.body[field];
      if (dateFields.has(field)) {
        data[field] = value ? new Date(value) : null;
      } else {
        data[field] = value === '' ? null : value;
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No editable fields provided.' });
    }

    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, getUserById, updatePrivateInfo };
