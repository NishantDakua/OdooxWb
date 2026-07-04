"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  updatePayrollSchema,
  type UpdatePayrollInput,
} from "@/lib/validations/payroll";
import type { PayrollDTO } from "@/types";

export function EditSalaryDialog({
  payroll,
  onClose,
  onSuccess,
}: {
  payroll: PayrollDTO | null;
  onClose: () => void;
  onSuccess: (updated: PayrollDTO) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePayrollInput>({
    resolver: zodResolver(updatePayrollSchema),
    defaultValues: { basic: 0, allowances: 0, deductions: 0 },
  });

  useEffect(() => {
    if (payroll) {
      reset({
        basic: payroll.basic,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
      });
    }
  }, [payroll, reset]);

  const watched = watch();
  const projectedNet =
    (Number(watched.basic) || 0) +
    (Number(watched.allowances) || 0) -
    (Number(watched.deductions) || 0);

  async function onSubmit(values: UpdatePayrollInput) {
    if (!payroll) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/payroll/${payroll.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update salary structure.");
      }

      const updated = await res.json();
      toast.success("Salary structure updated", {
        description: `${payroll.user?.name}'s payroll has been saved.`,
      });
      onSuccess(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={Boolean(payroll)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Salary Structure</DialogTitle>
          <DialogDescription>{payroll?.user?.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="basic">Basic Salary</Label>
            <Input id="basic" type="number" step="0.01" {...register("basic")} />
            {errors.basic && (
              <p className="text-xs text-destructive">{errors.basic.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="allowances">Allowances</Label>
            <Input id="allowances" type="number" step="0.01" {...register("allowances")} />
            {errors.allowances && (
              <p className="text-xs text-destructive">{errors.allowances.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deductions">Deductions</Label>
            <Input id="deductions" type="number" step="0.01" {...register("deductions")} />
            {errors.deductions && (
              <p className="text-xs text-destructive">{errors.deductions.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-blue-50/60 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Projected Net Salary</span>
            <span className="text-base font-bold text-blue-700">
              {formatCurrency(projectedNet)}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
