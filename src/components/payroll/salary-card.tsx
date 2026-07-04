"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import type { PayrollDTO } from "@/types";

export function SalaryCard({ userId }: { userId: string }) {
  const [payroll, setPayroll] = useState<PayrollDTO | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    setPayroll(undefined);
    fetch(`/api/payroll/${userId}`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setPayroll(data);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (payroll === undefined) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!payroll) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Wallet}
            title="No salary structure found"
            description="Contact HR if you believe this is an error."
          />
        </CardContent>
      </Card>
    );
  }

  const rows = [
    { label: "Basic Salary", value: payroll.basic },
    { label: "Allowances", value: payroll.allowances },
    { label: "Deductions", value: -payroll.deductions },
  ];

  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Salary Breakdown</CardTitle>
            <CardDescription>Current monthly compensation</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500">{row.label}</span>
              <span
                className={
                  row.value < 0
                    ? "text-sm font-medium text-rose-600"
                    : "text-sm font-medium text-slate-900"
                }
              >
                {row.value < 0 ? "− " : ""}
                {formatCurrency(Math.abs(row.value))}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-blue-50/60 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Net Salary</span>
            <span className="text-base font-bold text-blue-700">
              {formatCurrency(payroll.netSalary)}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          This is a read-only view. Reach out to HR for any salary structure queries.
        </p>
      </CardContent>
    </Card>
  );
}
