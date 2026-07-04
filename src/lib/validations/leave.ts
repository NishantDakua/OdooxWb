import { z } from "zod";

export const leaveTypeEnum = z.enum(["PAID", "SICK", "UNPAID"]);
export const leaveStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const applyLeaveSchema = z
  .object({
    userId: z.string().min(1, "Please select an employee."),
    type: leaveTypeEnum,
    dateRange: z.object({
      from: z.date({ required_error: "Start date is required." }),
      to: z.date({ required_error: "End date is required." }),
    }),
    remarks: z
      .string()
      .min(10, "Please add at least 10 characters explaining your leave.")
      .max(500, "Remarks must be under 500 characters."),
  })
  .refine((data) => data.dateRange.to >= data.dateRange.from, {
    message: "End date cannot be before the start date.",
    path: ["dateRange"],
  });

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;

export const leaveDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  hrComment: z.string().max(500).optional(),
});

export type LeaveDecisionInput = z.infer<typeof leaveDecisionSchema>;

export const LEAVE_ALLOCATION: Record<"PAID" | "SICK", number> = {
  PAID: 12,
  SICK: 8,
};
