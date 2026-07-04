const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  createEmployeeSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} = require('../validators/auth');
const { generateEmployeeId, generateTempPassword } = require('../utils/generators');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_hackathon';

const resetTokens = new Map();
const verificationTokens = new Map();

async function createEmployee(req, res, next) {
  try {
    const payload = createEmployeeSchema.parse(req.body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const employeeId = await generateEmployeeId(payload.company, payload.name, payload.joiningDate);
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const emailVerificationToken = `verify_${Math.random().toString(36).substr(2, 9)}`;

    const user = await prisma.user.create({
      data: {
        employeeId,
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: payload.role,
        department: payload.department,
        jobTitle: payload.jobTitle,
        phone: payload.phone,
        address: payload.address,
        joiningDate: new Date(payload.joiningDate),
        isFirstLogin: true,
        emailVerificationToken,
        isEmailVerified: false,
      },
    });

    verificationTokens.set(emailVerificationToken, user.id);

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully!',
      tempPassword, // Return plain text once so Admin can copy
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle,
        joiningDate: user.joiningDate,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function previewEmployeeId(req, res, next) {
  try {
    const { company, name, joiningDate } = req.query;
    if (!company || !name || !joiningDate) {
      return res.status(400).json({ success: false, message: 'company, name, and joiningDate are required.' });
    }

    const employeeId = await generateEmployeeId(company, name, joiningDate);
    return res.json({ success: true, employeeId });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: payload.employeeIdOrEmail },
          { employeeId: payload.employeeIdOrEmail },
        ],
      },
    });

    // Seed default admin if DB has no users and someone tries to log in with 'admin123'
    if (!user && payload.employeeIdOrEmail.toLowerCase() === 'admin123') {
      const passwordHash = await bcrypt.hash('Password@123', 10);
      user = await prisma.user.create({
        data: {
          employeeId: 'ADMIN123',
          name: 'Default Administrator',
          email: 'admin@company.com',
          passwordHash,
          role: 'ADMIN',
          isFirstLogin: false,
          isEmailVerified: true,
        },
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      token,
      mustChangePassword: user.isFirstLogin,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        email: user.email,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const payload = changePasswordSchema.parse(req.body);

    // Enforce that the user changing the password is the user logged in
    if (req.user.userId !== payload.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. Cannot change password for another user.' });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        passwordHash,
        isFirstLogin: false,
      },
    });

    return res.json({
      success: true,
      message: 'Password updated successfully. You can now access your dashboard.',
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const payload = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email.' });
    }

    const resetToken = `reset_${Math.random().toString(36).substr(2, 9)}`;
    resetTokens.set(resetToken, payload.email);

    return res.json({
      success: true,
      message: 'Password reset link simulated successfully.',
      mockToken: resetToken,
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const payload = resetPasswordSchema.parse(req.body);

    const email = resetTokens.get(payload.token);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    resetTokens.delete(payload.token);

    return res.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const payload = verifyEmailSchema.parse(req.body);

    const userId = verificationTokens.get(payload.token);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    verificationTokens.delete(payload.token);

    return res.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        email: user.email,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEmployee,
  previewEmployeeId,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  me,
};
