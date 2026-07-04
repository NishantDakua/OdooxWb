const { z } = require('zod');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createEmployeeSchema = z.object({
  company: z.string().min(2, 'Company name must be at least 2 characters.'),
  name: z.string().min(2, 'Employee name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required.'),
  jobTitle: z.string().min(1, 'Job Title is required.'),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'HR', 'EMPLOYEE']).default('EMPLOYEE'),
  joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid joining date format.',
  }),
});

const loginSchema = z.object({
  employeeIdOrEmail: z.string().min(1, 'Employee ID or Email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  password: z.string().regex(
    passwordPattern,
    'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
  ),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required.'),
});

const changePasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  password: z.string().regex(
    passwordPattern,
    'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
  ),
});

module.exports = {
  createEmployeeSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
};
