import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payroll = await prisma.payroll.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    });

    const withNet = payroll.map((p) => ({
      ...p,
      netSalary: p.basic + p.allowances - p.deductions,
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
