const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_hackathon';

async function login(req, res) {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required.' });
    }

    let user = await prisma.user.findUnique({
      where: { employeeId },
    });

    if (!user) {
      // For the hackathon, auto-create the user if they don't exist to make testing easy
      // Default to EMPLOYEE role. If employeeId is 'ADMIN123', make them an admin.
      const role = employeeId.toLowerCase().includes('admin') ? 'ADMIN' : 'EMPLOYEE';
      user = await prisma.user.create({
        data: {
          employeeId,
          name: `Mock ${role} (${employeeId})`,
          role,
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

module.exports = {
  login,
};
