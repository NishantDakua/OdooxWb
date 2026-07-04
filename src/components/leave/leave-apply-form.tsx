"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays, format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { applyLeaveSchema, type ApplyLeaveInput } from "@/lib/validations/leave";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LEAVE_TYPE_LABELS: Record<string, string> = {
  PAID: "Paid Leave",
  SICK: "Sick Leave",
  UNPAID: "Unpaid Leave",
};

export function LeaveApplyForm({
  userId,
  onSubmitted,
}: {
  userId: string;
  onSubmitted: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<ApplyLeaveInput>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      userId,
      type: "PAID",
      remarks: "",
    },
  });

  const watched = watch();
  const days =
    watched.dateRange?.from && watched.dateRange?.to
      ? differenceInCalendarDays(watched.dateRange.to, watched.dateRange.from) + 1
      : 0;

  async function openSummary() {
    const valid = await trigger();
    if (valid) setConfirmOpen(true);
  }

  async function onConfirmSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: watched.type,
          remarks: watched.remarks,
          dateRange: {
            from: watched.dateRange.from,
            to: watched.dateRange.to,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit leave request.");
      }

      toast.success("Leave request submitted", {
        description: "HR will review your request shortly.",
      });
      reset({ userId, type: "PAID", remarks: "", dateRange: undefined });
      setConfirmOpen(false);
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Leave</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            openSummary();
          }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="type">Leave Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="SICK">Sick</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Date Range</Label>
            <Controller
              control={control}
              name="dateRange"
              render={({ field }) => (
                <DateRangePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabledBefore={new Date()}
                />
              )}
            />
            {errors.dateRange && (
              <p className="text-xs text-destructive">
                {errors.dateRange.message ?? errors.dateRange.to?.message ?? errors.dateRange.from?.message}
              </p>
            )}
            {days > 0 && (
              <p className="text-xs text-slate-500">
                {days} day{days > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Briefly explain the reason for your leave..."
              {...register("remarks")}
            />
            {errors.remarks && (
              <p className="text-xs text-destructive">{errors.remarks.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            <Send className="h-4 w-4" />
            Review & Submit
          </Button>
        </form>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Leave Request</DialogTitle>
            <DialogDescription>
              Please review the details before submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="font-medium text-slate-900">
                {LEAVE_TYPE_LABELS[watched.type]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">From</span>
              <span className="font-medium text-slate-900">
                {watched.dateRange?.from
                  ? format(watched.dateRange.from, "dd MMM yyyy")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">To</span>
              <span className="font-medium text-slate-900">
                {watched.dateRange?.to
                  ? format(watched.dateRange.to, "dd MMM yyyy")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">Total Days</span>
              <span className="font-semibold text-slate-900">{days}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Edit
            </Button>
            <Button onClick={onConfirmSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
