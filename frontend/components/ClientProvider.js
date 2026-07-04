'use client';

import { AuthProvider } from '../lib/AuthContext';

export function ClientProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
