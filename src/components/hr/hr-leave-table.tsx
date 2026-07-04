"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, Check, X, CalendarX2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/leave/status-badge";
import { LeaveActionDialog } from "@/components/hr/leave-action-dialog";
import type { LeaveDTO, LeaveStatus } from "@/types";

export function HrLeaveTable() {
  const [leaves, setLeaves] = useState<LeaveDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [actionState, setActionState] = useState<{
    leave: LeaveDTO | null;
    action: Extract<LeaveStatus, "APPROVED" | "REJECTED"> | null;
  }>({ leave: null, action: null });

  async function fetchLeaves() {
    setLoading(true);
    try {
      const res = await fetch("/api/leaves");
      const data = await res.json();
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filtered = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch = leave.user?.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || leave.status === statusFilter;
      const matchesType = typeFilter === "ALL" || leave.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaves, search, statusFilter, typeFilter]);

  function handleUpdated(updated: LeaveDTO) {
    setLeaves((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setActionState({ leave: null, action: null });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by employee name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="SICK">Sick</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No leave requests found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell className="font-medium text-slate-900">
                  {leave.user?.name}
                </TableCell>
                <TableCell>{leave.type}</TableCell>
                <TableCell>{format(new Date(leave.startDate), "dd MMM yyyy")}</TableCell>
                <TableCell>{format(new Date(leave.endDate), "dd MMM yyyy")}</TableCell>
                <TableCell>{leave.days}</TableCell>
                <TableCell className="max-w-[200px] truncate text-slate-500">
                  {leave.remarks || "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={leave.status} />
                </TableCell>
                <TableCell className="text-right">
                  {leave.status === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() =>
                          setActionState({ leave, action: "APPROVED" })
                        }
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setActionState({ leave, action: "REJECTED" })
                        }
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Decided</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <LeaveActionDialog
        leave={actionState.leave}
        action={actionState.action}
        onClose={() => setActionState({ leave: null, action: null })}
        onSuccess={handleUpdated}
      />
    </div>
  );
}
