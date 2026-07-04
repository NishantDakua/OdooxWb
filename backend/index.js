const express = require('express');
const cors = require('cors');
require('dotenv').config();

const attendanceController = require('./controllers/attendanceController');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const salaryController = require('./controllers/salaryController');
const leaveController = require('./controllers/leaveController');
const { requireAuth, requireAdmin, requireAdminOrHR } = require('./middlewares/authMiddleware');
const { requireRole } = require('./middlewares/requireRole');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth Routes
app.post('/api/auth/create-employee', requireAuth, requireAdminOrHR, authController.createEmployee);
app.get('/api/auth/preview-id', requireAuth, requireAdminOrHR, authController.previewEmployeeId);
app.post('/api/auth/change-password', requireAuth, authController.changePassword);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/reset-password', authController.resetPassword);
app.post('/api/auth/verify-email', authController.verifyEmail);
app.get('/api/auth/me', requireAuth, authController.me);

// Attendance Routes
app.get('/api/attendance', requireAuth, attendanceController.getAttendance);
app.get('/api/attendance/:userId', requireAuth, attendanceController.getAttendanceByUserId);
app.post('/api/attendance/checkin', requireAuth, attendanceController.checkIn);
app.post('/api/attendance/check-out', requireAuth, attendanceController.checkOut);
app.post('/api/attendance/check-in', requireAuth, attendanceController.checkIn);
app.post('/api/attendance/checkout', requireAuth, attendanceController.checkOut);
app.get('/api/attendance/history', requireAuth, attendanceController.getHistory);

// Admin Routes — attendance records across all employees (ADMIN + HR)
app.get('/api/admin/attendance', requireAuth, requireRole('ADMIN', 'HR'), attendanceController.getAdminAttendance);

// User / Profile Routes
app.get('/api/users', requireAuth, requireRole('ADMIN', 'HR'), userController.listUsers);
app.get('/api/users/:id', requireAuth, userController.getUserById);
app.put('/api/users/:id/private-info', requireAuth, userController.updatePrivateInfo);

// Salary Routes (ADMIN + HR only)
app.get('/api/salary-structure/:userId', requireAuth, requireRole('ADMIN', 'HR'), salaryController.getSalaryStructure);

// Leave Routes
app.get('/api/leaves/me', requireAuth, leaveController.getMyLeaves);
app.get('/api/leaves', requireAuth, requireRole('ADMIN', 'HR'), leaveController.getAllLeaves);
app.post('/api/leaves', requireAuth, leaveController.createLeave);
app.patch('/api/leaves/:id/status', requireAuth, requireRole('ADMIN', 'HR'), leaveController.updateLeaveStatus);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});