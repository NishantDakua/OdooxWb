'use client';

import { useAuth } from './AuthContext';

// Single source of truth for role checks on the frontend.
// Usage: const canManage = useHasRole('ADMIN', 'HR');
export function useHasRole(...roles) {
  const { user } = useAuth();
  if (!user) return false;
  return roles.includes(user.role);
}
