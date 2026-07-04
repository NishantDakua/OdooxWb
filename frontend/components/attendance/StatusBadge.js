import { Badge } from '../ui/badge';
import { getStatusLabel, getStatusTone } from '../../lib/attendance';

export function StatusBadge({ status }) {
  return <Badge tone={getStatusTone(status)}>{getStatusLabel(status)}</Badge>;
}
