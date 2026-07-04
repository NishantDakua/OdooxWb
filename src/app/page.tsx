"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { currentUser, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace(currentUser.role === "HR" ? "/hr/leave" : "/employee/leave");
    }
  }, [loading, currentUser, router]);

  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
