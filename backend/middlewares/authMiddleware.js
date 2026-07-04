const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_hackathon';

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Core infrastructure check: make sure the user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = {
      userId: user.id,
      role: user.role,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
  }
  next();
}

function requireAdminOrHR(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'HR')) {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin or HR access required.' });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireAdminOrHR,
};
