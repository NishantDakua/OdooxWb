import { HrPayrollTable } from "@/components/hr/hr-payroll-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HrPayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Payroll Management</h1>
        <p className="text-sm text-slate-500">
          View and update salary structures for all employees.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>Edit basic pay, allowances, and deductions.</CardDescription>
        </CardHeader>
        <CardContent>
          <HrPayrollTable />
        </CardContent>
      </Card>
    </div>
  );
}
