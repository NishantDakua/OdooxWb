"use client";

import { useCurrentUser } from "@/context/user-context";
import { SalaryCard } from "@/components/payroll/salary-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeePayrollPage() {
  const { currentUser, loading } = useCurrentUser();

  if (loading || !currentUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 max-w-md w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Payroll</h1>
        <p className="text-sm text-slate-500">
          View your current salary structure for {currentUser.name}.
        </p>
      </div>
      <SalaryCard userId={currentUser.id} />
    </div>
  );
}
