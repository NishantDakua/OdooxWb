'use client';

import { useAuth } from '@/lib/AuthContext';
import { ProfileView } from '@/components/profile/ProfileView';

export default function MyProfilePage() {
  const { user } = useAuth();

  // Shell guarantees an authenticated user before rendering children.
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProfileView userId={user.id} isReadOnly={false} />
    </div>
  );
}
