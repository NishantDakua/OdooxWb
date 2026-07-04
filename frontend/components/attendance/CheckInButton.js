import { Button } from '../ui/button';

export function CheckInButton({ onClick, loading = false, disabled = false }) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} className="action-button">
      {loading ? 'Checking in...' : 'Check In'}
    </Button>
  );
}
