"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrentUser } from "@/context/user-context";
import { LeaveApplyForm } from "@/components/leave/leave-apply-form";
import { LeaveBalanceCard } from "@/components/leave/leave-balance-card";
import { LeaveHistoryTable } from "@/components/leave/leave-history-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaveDTO } from "@/types";

export default function EmployeeLeavePage() {
  const { currentUser, loading: userLoading } = useCurrentUser();
  const [leaves, setLeaves] = useState<LeaveDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceKey, setBalanceKey] = useState(0);

  const fetchLeaves = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaves?userId=${userId}`);
      const data = await res.json();
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchLeaves(currentUser.id);
  }, [currentUser, fetchLeaves]);

  if (userLoading || !currentUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Leave</h1>
        <p className="text-sm text-slate-500">
          Apply for leave and track the status of your requests.
        </p>
      </div>

      <LeaveBalanceCard key={balanceKey} userId={currentUser.id} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <LeaveApplyForm
          userId={currentUser.id}
          onSubmitted={() => {
            fetchLeaves(currentUser.id);
            setBalanceKey((k) => k + 1);
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveHistoryTable leaves={leaves} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
