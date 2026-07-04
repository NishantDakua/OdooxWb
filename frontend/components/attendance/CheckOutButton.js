import { Button } from '../ui/button';

export function CheckOutButton({ onClick, loading = false, disabled = false }) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} variant="secondary" className="action-button">
      {loading ? 'Checking out...' : 'Check Out'}
    </Button>
  );
}
