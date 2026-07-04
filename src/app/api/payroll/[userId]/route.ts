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
    const payroll = await prisma.payroll.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!payroll) {
      return NextResponse.json(
        { error: "No payroll record found for this employee." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...payroll,
      netSalary: payroll.basic + payroll.allowances - payroll.deductions,
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

    const updated = await prisma.payroll.upsert({
      where: { userId },
      update: parsed.data,
      create: { userId, ...parsed.data },
      include: { user: true },
    });

    return NextResponse.json({
      ...updated,
      netSalary: updated.basic + updated.allowances - updated.deductions,
    });
  } catch (error) {
    console.error("PATCH /api/payroll/[userId] error:", error);
    return NextResponse.json(
      { error: "Failed to update payroll record." },
      { status: 500 }
    );
  }
}
