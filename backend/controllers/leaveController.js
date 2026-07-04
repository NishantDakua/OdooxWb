const { prisma } = require('../lib/prisma');

const LEAVE_TYPES = ['PAID', 'SICK', 'UNPAID'];
const REVIEW_STATUSES = ['APPROVED', 'REJECTED'];

const requesterSelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  department: true,
  jobTitle: true,
};

// GET /api/leaves/me — the logged-in user's own leaves.
async function getMyLeaves(req, res, next) {
  try {
    const leaves = await prisma.leave.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
}

// GET /api/leaves?status=PENDING  (ADMIN/HR) — all leaves, optional status filter.
async function getAllLeaves(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const leaves = await prisma.leave.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: requesterSelect } },
    });
    return res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
}

// POST /api/leaves — apply for leave (own).
async function createLeave(req, res, next) {
  try {
    const { type, startDate, endDate, remarks } = req.body;

    if (!type || !LEAVE_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Valid leave type is required.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid dates.' });
    }
    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    }

    const leave = await prisma.leave.create({
      data: {
        userId: req.user.userId,
        type,
        startDate: start,
        endDate: end,
        remarks: remarks || null,
        status: 'PENDING',
      },
    });
    return res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/leaves/:id/status  (ADMIN/HR) — approve / reject.
async function updateLeaveStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }

    const existing = await prisma.leave.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Leave not found.' });
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        adminComment: adminComment || null,
        reviewedById: req.user.userId,
        reviewedAt: new Date(),
      },
      include: { requester: { select: requesterSelect } },
    });
    return res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyLeaves, getAllLeaves, createLeave, updateLeaveStatus };
