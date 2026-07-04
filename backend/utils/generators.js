const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function cleanInitials(part) {
  if (!part) return 'XX';
  const clean = part.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (clean.length < 2) {
    return (clean + 'XX').substring(0, 2);
  }
  return clean.substring(0, 2);
}

async function generateEmployeeId(companyName, fullName, joiningDateString) {
  const companyCode = cleanInitials(companyName);
  
  // Extract first and last name initials
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  
  const firstInitials = cleanInitials(firstName);
  const lastInitials = cleanInitials(lastName);

  const date = new Date(joiningDateString);
  const year = date.getFullYear();

  const idPrefix = `${companyCode}${firstInitials}${lastInitials}${year}`;

  // Find users whose employeeId starts with the prefix to calculate running number
  const matches = await prisma.user.findMany({
    where: {
      employeeId: {
        startsWith: idPrefix,
      },
    },
    select: { employeeId: true },
  });

  let maxSerial = 0;
  matches.forEach((u) => {
    // employeeId format is idPrefix + 4-digit serial (e.g. OIJODO20230001)
    const serialStr = u.employeeId.slice(idPrefix.length);
    const parsed = parseInt(serialStr, 10);
    if (!isNaN(parsed) && parsed > maxSerial) {
      maxSerial = parsed;
    }
  });

  const nextSerial = maxSerial + 1;
  const paddedSerial = String(nextSerial).padStart(4, '0');

  return `${idPrefix}${paddedSerial}`;
}

function generateTempPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  
  // Ensure we satisfy basic strength requirements: upper, lower, number, symbol
  password += 'A';
  password += 'a';
  password += '1';
  password += '!';

  for (let i = 4; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  // Shuffle the password so the guaranteed chars aren't always at the start
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

module.exports = {
  generateEmployeeId,
  generateTempPassword,
};
