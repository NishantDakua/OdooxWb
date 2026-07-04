import { HrLeaveTable } from "@/components/hr/hr-leave-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HrLeavePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Leave Approvals</h1>
        <p className="text-sm text-slate-500">
          Review, search, and act on employee leave requests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
          <CardDescription>
            Approve or reject pending requests. Decisions update instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HrLeaveTable />
        </CardContent>
      </Card>
    </div>
  );
}
