"use client";

import { Toaster } from "sonner";
import { UserProvider } from "@/context/user-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </UserProvider>
  );
}
