"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserDTO } from "@/types";

interface UserContextValue {
  users: UserDTO[];
  currentUser: UserDTO | null;
  setCurrentUserId: (id: string) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const STORAGE_KEY = "hrms.currentUserId";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users");
        const data: UserDTO[] = await res.json();
        setUsers(data);
        const stored =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEY)
            : null;
        const validStored = data.find((u) => u.id === stored);
        setCurrentUserIdState(validStored ? validStored.id : data[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  };

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  return (
    <UserContext.Provider
      value={{ users, currentUser, setCurrentUserId, loading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider");
  return ctx;
}
