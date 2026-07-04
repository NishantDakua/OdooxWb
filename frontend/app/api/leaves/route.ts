import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { applyLeaveSchema } from "@/lib/validations/leave";

// GET /api/leaves?userId=&status=&search=&type=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const leaves = await prisma.leave.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(status && status !== "ALL" ? { status: status as never } : {}),
        ...(type && type !== "ALL" ? { type: type as never } : {}),
        ...(search
          ? {
              requester: {
                name: { contains: search, mode: "insensitive" },
              },
            }
          : {}),
      },
      include: { requester: true },
      orderBy: { createdAt: "desc" },
    });

    const mapped = leaves.map((l: any) => ({
      ...l,
      user: l.requester,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/leaves error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests." },
      { status: 500 }
    );
  }
}

// POST /api/leaves
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = applyLeaveSchema.safeParse({
      ...body,
      dateRange: {
        from: new Date(body.dateRange.from),
        to: new Date(body.dateRange.to),
      },
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, type, dateRange, remarks } = parsed.data;
    const days = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;

    const leave = await prisma.leave.create({
      data: {
        userId,
        type,
        startDate: dateRange.from,
        endDate: dateRange.to,
        remarks,
      },
      include: { requester: true },
    });

    return NextResponse.json({
      ...leave,
      user: (leave as any).requester,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leaves error:", error);
    return NextResponse.json(
      { error: "Failed to submit leave request." },
      { status: 500 }
    );
  }
}
