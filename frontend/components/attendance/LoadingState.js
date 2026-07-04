import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function LoadingState() {
  return (
    <Card>
      <CardContent className="loading-stack">
        <Skeleton className="loading-line" />
        <Skeleton className="loading-line" />
        <Skeleton className="loading-block" />
      </CardContent>
    </Card>
  );
}
