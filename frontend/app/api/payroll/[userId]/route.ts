import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePayrollSchema } from "@/lib/validations/payroll";

// GET /api/payroll/:userId
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const payroll = await prisma.payroll.findFirst({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    if (!payroll) {
      return NextResponse.json(
        { error: "No payroll record found for this employee." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...payroll,
      basic: Number(payroll.baseSalary),
      allowances: Number(payroll.allowances),
      deductions: Number(payroll.deductions),
      netSalary: Number(payroll.baseSalary) + Number(payroll.allowances) - Number(payroll.deductions),
    });
  } catch (error) {
    console.error("GET /api/payroll/[userId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll record." },
      { status: 500 }
    );
  }
}

// PATCH /api/payroll/:userId  -> HR edits salary structure
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const parsed = updatePayrollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.payroll.findFirst({
      where: { userId },
    });

    let updated;
    const baseSalary = parsed.data.basic;
    const allowances = parsed.data.allowances;
    const deductions = parsed.data.deductions;
    const netSalary = baseSalary + allowances - deductions;

    if (existing) {
      updated = await prisma.payroll.update({
        where: { id: existing.id },
        data: {
          baseSalary,
          allowances,
          deductions,
          netSalary,
        },
        include: { user: true },
      });
    } else {
      updated = await prisma.payroll.create({
        data: {
          userId,
          baseSalary,
          allowances,
          deductions,
          netSalary,
          effectiveDate: new Date(),
        },
        include: { user: true },
      });
    }

    return NextResponse.json({
      ...updated,
      basic: Number(updated.baseSalary),
      allowances: Number(updated.allowances),
      deductions: Number(updated.deductions),
      netSalary: Number(updated.baseSalary) + Number(updated.allowances) - Number(updated.deductions),
    });
  } catch (error) {
    console.error("PATCH /api/payroll/[userId] error:", error);
    return NextResponse.json(
      { error: "Failed to update payroll record." },
      { status: 500 }
    );
  }
}
