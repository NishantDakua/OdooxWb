import { AttendanceWorkspace } from '../../../components/attendance/AttendanceWorkspace';

export default function TodayPage() {
  return <AttendanceWorkspace scope="today" title="Today" description="Check in, check out, and see today's attendance details." />;
}
