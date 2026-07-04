'use client';

import { useHasRole } from '../../lib/roles';

// Renders children only when the current user has one of the allowed roles.
// Usage: <RoleGate roles={['ADMIN','HR']}>...</RoleGate>
export function RoleGate({ roles = [], children, fallback = null }) {
  const allowed = useHasRole(...roles);
  return allowed ? <>{children}</> : fallback;
}
