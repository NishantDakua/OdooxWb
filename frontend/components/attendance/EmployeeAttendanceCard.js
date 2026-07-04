import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatWorkingHours } from '../../lib/attendance';

export function EmployeeAttendanceCard({ record }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{record.user?.name || record.user?.employeeId || 'Employee Attendance'}</CardTitle>
      </CardHeader>
      <CardContent className="employee-card">
        <div>
          <span>Date</span>
          <strong>{formatDate(record.date)}</strong>
        </div>
        <div>
          <span>Status</span>
          <StatusBadge status={record.status} />
        </div>
        <div>
          <span>Working Hours</span>
          <strong>{formatWorkingHours(record.checkIn, record.checkOut)}</strong>
        </div>
      </CardContent>
    </Card>
  );
}
