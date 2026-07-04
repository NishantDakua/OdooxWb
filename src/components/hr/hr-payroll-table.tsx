"use client";

import { useEffect, useState } from "react";
import { Pencil, Users2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { EditSalaryDialog } from "@/components/hr/edit-salary-dialog";
import { formatCurrency } from "@/lib/utils";
import type { PayrollDTO } from "@/types";

export function HrPayrollTable() {
  const [records, setRecords] = useState<PayrollDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PayrollDTO | null>(null);

  async function fetchPayroll() {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll");
      const data = await res.json();
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayroll();
  }, []);

  function handleUpdated(updated: PayrollDTO) {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditing(null);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title="No payroll records found"
        description="Add salary structures for your employees to get started."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Basic</TableHead>
            <TableHead>Allowances</TableHead>
            <TableHead>Deductions</TableHead>
            <TableHead>Net Salary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium text-slate-900">
                {record.user?.name}
              </TableCell>
              <TableCell className="text-slate-500">
                {record.user?.department || "—"}
              </TableCell>
              <TableCell>{formatCurrency(record.basic)}</TableCell>
              <TableCell>{formatCurrency(record.allowances)}</TableCell>
              <TableCell>{formatCurrency(record.deductions)}</TableCell>
              <TableCell className="font-semibold text-blue-700">
                {formatCurrency(record.netSalary)}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setEditing(record)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditSalaryDialog
        payroll={editing}
        onClose={() => setEditing(null)}
        onSuccess={handleUpdated}
      />
    </>
  );
}
