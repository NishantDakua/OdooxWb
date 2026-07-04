const express = require('express');
const cors = require('cors');
require('dotenv').config();

const attendanceController = require('./controllers/attendanceController');
const authController = require('./controllers/authController');
const { requireAuth, requireAdmin } = require('./middlewares/authMiddleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth Routes
app.post('/api/auth/login', authController.login);

// Attendance Routes
app.get('/api/attendance', requireAuth, attendanceController.getAttendance);
app.get('/api/attendance/:userId', requireAuth, attendanceController.getAttendanceByUserId);
app.post('/api/attendance/checkin', requireAuth, attendanceController.checkIn);
app.post('/api/attendance/check-out', requireAuth, attendanceController.checkOut);
app.post('/api/attendance/check-in', requireAuth, attendanceController.checkIn);
app.post('/api/attendance/checkout', requireAuth, attendanceController.checkOut);
app.get('/api/attendance/history', requireAuth, attendanceController.getHistory);

// Admin Routes
app.get('/api/admin/attendance', requireAuth, requireAdmin, attendanceController.getAdminAttendance);

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});