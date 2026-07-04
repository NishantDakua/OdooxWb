const { prisma } = require('../lib/prisma');

// GET /api/salary-structure/:userId  (ADMIN/HR)
// Latest SalaryStructure (highest effectiveDate) with its components.
// Returns data: null (not an error) when none exists.
async function getSalaryStructure(req, res, next) {
  try {
    const { userId } = req.params;
    const structure = await prisma.salaryStructure.findFirst({
      where: { userId },
      orderBy: { effectiveDate: 'desc' },
      include: { components: true },
    });
    return res.json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSalaryStructure };
