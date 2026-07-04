"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaveBalanceDTO } from "@/types";

const LABELS: Record<string, string> = {
  PAID: "Paid Leave",
  SICK: "Sick Leave",
};

export function LeaveBalanceCard({ userId }: { userId: string }) {
  const [balances, setBalances] = useState<LeaveBalanceDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/leaves/balance?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setBalances(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {loading || !balances
          ? Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))
          : balances.map((b) => (
              <div
                key={b.type}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {LABELS[b.type]}
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {b.remaining}
                  <span className="ml-1 text-sm font-normal text-slate-400">
                    / {b.allocated} days
                  </span>
                </p>
                {b.pending > 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    {b.pending} day(s) pending approval
                  </p>
                )}
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
