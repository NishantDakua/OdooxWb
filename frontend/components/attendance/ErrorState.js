import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function ErrorState({ title = 'Something went wrong', message }) {
  return (
    <Card className="error-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{message}</CardContent>
    </Card>
  );
}
