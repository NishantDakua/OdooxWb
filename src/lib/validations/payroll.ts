import { z } from "zod";

export const updatePayrollSchema = z.object({
  basic: z.coerce.number().min(0, "Basic salary cannot be negative."),
  allowances: z.coerce.number().min(0, "Allowances cannot be negative."),
  deductions: z.coerce.number().min(0, "Deductions cannot be negative."),
});

export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>;
