import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function EmptyState({ title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{description}</CardContent>
    </Card>
  );
}
