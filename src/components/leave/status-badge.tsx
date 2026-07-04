import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "@/types";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const config: Record<
  LeaveStatus,
  { label: string; variant: "pending" | "approved" | "rejected"; icon: React.ElementType }
> = {
  PENDING: { label: "Pending", variant: "pending", icon: Clock },
  APPROVED: { label: "Approved", variant: "approved", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", variant: "rejected", icon: XCircle },
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
