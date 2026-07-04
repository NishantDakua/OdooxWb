import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payroll = await prisma.payroll.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    });

    const withNet = payroll.map((p: any) => ({
      ...p,
      basic: Number(p.baseSalary),
      allowances: Number(p.allowances),
      deductions: Number(p.deductions),
      netSalary: Number(p.baseSalary) + Number(p.allowances) - Number(p.deductions),
    }));

    return NextResponse.json(withNet);
  } catch (error) {
    console.error("GET /api/payroll error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll records." },
      { status: 500 }
    );
  }
}
