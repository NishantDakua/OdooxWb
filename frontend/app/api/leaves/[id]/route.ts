import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaveDecisionSchema } from "@/lib/validations/leave";

// PATCH /api/leaves/:id  -> approve / reject
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = leaveDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.leave.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Leave request not found." },
        { status: 404 }
      );
    }
    if (existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "This leave request has already been decided." },
        { status: 409 }
      );
    }

    const updated = await prisma.leave.update({
      where: { id },
      data: {
        status: parsed.data.status,
        adminComment: parsed.data.hrComment,
      },
      include: { requester: true },
    });

    return NextResponse.json({
      ...updated,
      user: (updated as any).requester,
    });
  } catch (error) {
    console.error("PATCH /api/leaves/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update leave request." },
      { status: 500 }
    );
  }
}
