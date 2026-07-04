import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LEAVE_ALLOCATION } from "@/lib/validations/leave";
import type { LeaveBalanceDTO, LeaveType } from "@/types";

// GET /api/leaves/balance?userId=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const leaves = await prisma.leave.findMany({
      where: { userId, type: { in: ["PAID", "SICK"] } },
    });

    const balances: LeaveBalanceDTO[] = (["PAID", "SICK"] as LeaveType[]).map(
      (type) => {
        const relevant = leaves.filter((l: any) => l.type === type);
        const used = relevant
          .filter((l: any) => l.status === "APPROVED")
          .reduce((sum: number, l: any) => sum + l.days, 0);
        const pending = relevant
          .filter((l: any) => l.status === "PENDING")
          .reduce((sum: number, l: any) => sum + l.days, 0);
        const allocated = LEAVE_ALLOCATION[type as "PAID" | "SICK"];

        return {
          type,
          allocated,
          used,
          pending,
          remaining: Math.max(allocated - used - pending, 0),
        };
      }
    );

    return NextResponse.json(balances);
  } catch (error) {
    console.error("GET /api/leaves/balance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave balance." },
      { status: 500 }
    );
  }
}
