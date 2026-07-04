const { z } = require('zod');

const attendanceStatuses = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];

const uuidSchema = z.string().min(1, 'Invalid user ID format.');
const dateSchema = z.coerce.date({ message: 'Invalid date value.' });
const attendanceStatusSchema = z.enum(attendanceStatuses);

const attendanceCheckInSchema = z.object({
  userId: uuidSchema,
});

const attendanceCheckOutSchema = z.object({
  userId: uuidSchema,
});

const attendanceHistoryQuerySchema = z.object({
  userId: uuidSchema.optional(),
  status: attendanceStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

module.exports = {
  attendanceStatuses,
  attendanceStatusSchema,
  attendanceCheckInSchema,
  attendanceCheckOutSchema,
  attendanceHistoryQuerySchema,
  uuidSchema,
  dateSchema,
};
