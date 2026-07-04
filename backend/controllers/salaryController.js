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

const CALC_TYPES = ['FIXED_AMOUNT', 'PERCENTAGE'];
const WAGE_TYPES = ['MONTHLY', 'YEARLY'];

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// computedAmount is ALWAYS derived on the server, never trusted from the client.
function computeAmount(component, monthlyWage) {
  if (component.calculationType === 'PERCENTAGE') {
    return Math.round((monthlyWage * num(component.value)) / 100);
  }
  return Math.round(num(component.value));
}

// PUT /api/salary-structure/:userId  (ADMIN/HR)
// Creates or replaces the user's latest salary structure + components.
async function updateSalaryStructure(req, res, next) {
  try {
    const { userId } = req.params;
    const body = req.body || {};

    if (!WAGE_TYPES.includes(body.wageType)) {
      return res.status(400).json({ success: false, message: 'Valid wageType (MONTHLY or YEARLY) is required.' });
    }

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const monthlyWage = num(body.monthlyWage);
    const components = Array.isArray(body.components) ? body.components : [];

    for (const c of components) {
      if (!c.name || !c.name.trim()) {
        return res.status(400).json({ success: false, message: 'Each component needs a name.' });
      }
      if (!CALC_TYPES.includes(c.calculationType)) {
        return res.status(400).json({ success: false, message: 'Each component needs a valid calculationType.' });
      }
    }

    const scalar = {
      wageType: body.wageType,
      monthlyWage,
      yearlyWage: num(body.yearlyWage),
      workingHoursPerWeek: num(body.workingHoursPerWeek),
      breakTimeMinutes: body.breakTimeMinutes === '' || body.breakTimeMinutes == null ? null : Math.round(num(body.breakTimeMinutes)),
      employeePfPercent: num(body.employeePfPercent),
      employerPfPercent: num(body.employerPfPercent),
      professionalTax: num(body.professionalTax),
      effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
    };

    const componentData = components.map((c) => ({
      name: c.name.trim(),
      calculationType: c.calculationType,
      value: num(c.value),
      computedAmount: computeAmount(c, monthlyWage),
    }));

    const existing = await prisma.salaryStructure.findFirst({
      where: { userId },
      orderBy: { effectiveDate: 'desc' },
      select: { id: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.salaryComponent.deleteMany({ where: { salaryStructureId: existing.id } });
        return tx.salaryStructure.update({
          where: { id: existing.id },
          data: { ...scalar, components: { create: componentData } },
          include: { components: true },
        });
      }
      return tx.salaryStructure.create({
        data: { userId, ...scalar, components: { create: componentData } },
        include: { components: true },
      });
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSalaryStructure, updateSalaryStructure };
