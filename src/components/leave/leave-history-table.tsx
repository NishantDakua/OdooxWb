"use client";

import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/leave/status-badge";
import { CalendarX2 } from "lucide-react";
import type { LeaveDTO } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  PAID: "Paid",
  SICK: "Sick",
  UNPAID: "Unpaid",
};

export function LeaveHistoryTable({
  leaves,
  loading,
}: {
  leaves: LeaveDTO[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="No leave requests yet"
        description="Your submitted leave requests will show up here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Remarks</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>HR Comment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaves.map((leave) => (
          <TableRow key={leave.id}>
            <TableCell className="font-medium text-slate-900">
              {TYPE_LABELS[leave.type]}
            </TableCell>
            <TableCell>{format(new Date(leave.startDate), "dd MMM yyyy")}</TableCell>
            <TableCell>{format(new Date(leave.endDate), "dd MMM yyyy")}</TableCell>
            <TableCell>{leave.days}</TableCell>
            <TableCell className="max-w-[220px] truncate text-slate-500">
              {leave.remarks || "—"}
            </TableCell>
            <TableCell>
              <StatusBadge status={leave.status} />
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-slate-500">
              {leave.hrComment || "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
