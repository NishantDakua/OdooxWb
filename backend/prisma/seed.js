// Idempotent seed: enriches profile fields + salary structures for the main
// seeded employees. Matches the CURRENT schema.prisma. Does NOT wipe users,
// attendance, or leaves — only fills profile data and (re)creates salary rows.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const profiles = {
  'EMP-0001': {
    phone: '+91 98200 11001', address: '12 Marine Drive, Mumbai',
    dateOfBirth: new Date('1988-03-14'), residingAddress: 'Flat 4B, Sea Breeze Apartments, Mumbai',
    nationality: 'Indian', personalEmail: 'asha.personal@gmail.com', gender: 'Female',
    maritalStatus: 'Married', joiningDate: new Date('2018-06-01'),
    bankAccountNumber: '50100234567801', bankName: 'HDFC Bank', ifscCode: 'HDFC0000123',
    panNumber: 'AVKPA1234C', uanNumber: '100234567890',
  },
  'EMP-0002': {
    phone: '+91 98200 11002', address: '7 MG Road, Bengaluru',
    dateOfBirth: new Date('1995-07-22'), residingAddress: '221 Koramangala, Bengaluru',
    nationality: 'Indian', personalEmail: 'rohan.personal@gmail.com', gender: 'Male',
    maritalStatus: 'Single', joiningDate: new Date('2021-02-15'),
    bankAccountNumber: '50100234567802', bankName: 'ICICI Bank', ifscCode: 'ICIC0000456',
    panNumber: 'BMKPR5678D', uanNumber: '100234567891',
  },
  'EMP-0003': {
    phone: '+91 98200 11003', address: '18 Anna Salai, Chennai',
    dateOfBirth: new Date('1993-11-05'), residingAddress: 'Plot 9, T Nagar, Chennai',
    nationality: 'Indian', personalEmail: 'priya.personal@gmail.com', gender: 'Female',
    maritalStatus: 'Married', joiningDate: new Date('2020-09-10'),
    bankAccountNumber: '50100234567803', bankName: 'Axis Bank', ifscCode: 'UTIB0000789',
    panNumber: 'CNKPN9012E', uanNumber: '100234567892',
  },
  'EMP-0004': {
    phone: '+91 98200 11004', address: '3 Sector 17, Chandigarh',
    dateOfBirth: new Date('1996-01-30'), residingAddress: 'House 45, Sector 22, Chandigarh',
    nationality: 'Indian', personalEmail: 'karan.personal@gmail.com', gender: 'Male',
    maritalStatus: 'Single', joiningDate: new Date('2022-07-01'),
    bankAccountNumber: '50100234567804', bankName: 'SBI', ifscCode: 'SBIN0000111',
    panNumber: 'DKKPS3456F', uanNumber: '100234567893',
  },
  'EMP-0005': {
    phone: '+91 98200 11005', address: '25 FC Road, Pune',
    dateOfBirth: new Date('1994-09-18'), residingAddress: 'B-12, Kothrud, Pune',
    nationality: 'Indian', personalEmail: 'sneha.personal@gmail.com', gender: 'Female',
    maritalStatus: 'Single', joiningDate: new Date('2021-11-20'),
    bankAccountNumber: '50100234567805', bankName: 'Kotak Mahindra', ifscCode: 'KKBK0000222',
    panNumber: 'ELKPS7890G', uanNumber: '100234567894',
  },
};

// monthlyWage -> component set. computedAmount is computed here and stored as-is.
function buildSalary(monthlyWage) {
  const yearlyWage = monthlyWage * 12;
  const components = [
    { name: 'Basic', calculationType: 'PERCENTAGE', value: 50 },
    { name: 'HRA', calculationType: 'PERCENTAGE', value: 20 },
    { name: 'Special Allowance', calculationType: 'FIXED_AMOUNT', value: monthlyWage * 0.2 },
    { name: 'Conveyance', calculationType: 'FIXED_AMOUNT', value: 1600 },
  ].map((c) => ({
    ...c,
    computedAmount:
      c.calculationType === 'PERCENTAGE'
        ? Math.round((monthlyWage * c.value) / 100)
        : Math.round(c.value),
  }));
  return {
    wageType: 'MONTHLY',
    monthlyWage,
    yearlyWage,
    workingHoursPerWeek: 40,
    breakTimeMinutes: 60,
    employeePfPercent: 12,
    employerPfPercent: 12,
    professionalTax: 200,
    effectiveDate: new Date('2026-01-01'),
    components: { create: components },
  };
}

const wages = {
  'EMP-0001': 90000,
  'EMP-0002': 60000,
  'EMP-0003': 65000,
  'EMP-0004': 48000,
  'EMP-0005': 52000,
};

async function main() {
  for (const [employeeId, data] of Object.entries(profiles)) {
    const user = await prisma.user.findUnique({ where: { employeeId } });
    if (!user) {
      console.warn(`Skip ${employeeId}: not found`);
      continue;
    }
    await prisma.user.update({ where: { id: user.id }, data });
    // Rebuild salary structure for this user (idempotent)
    await prisma.salaryStructure.deleteMany({ where: { userId: user.id } });
    await prisma.salaryStructure.create({
      data: { userId: user.id, ...buildSalary(wages[employeeId]) },
    });
    console.log(`Seeded ${employeeId} (${user.name})`);
  }
  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
