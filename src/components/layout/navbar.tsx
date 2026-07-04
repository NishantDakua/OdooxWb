"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Wallet, ShieldCheck, Users2 } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useCurrentUser } from "@/context/user-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const employeeLinks = [
  { href: "/employee/leave", label: "My Leave", icon: CalendarDays },
  { href: "/employee/payroll", label: "My Payroll", icon: Wallet },
];

const hrLinks = [
  { href: "/hr/leave", label: "Leave Approvals", icon: ShieldCheck },
  { href: "/hr/payroll", label: "Payroll", icon: Users2 },
];

export function Navbar() {
  const pathname = usePathname();
  const { users, currentUser, setCurrentUserId, loading } = useCurrentUser();

  const links = currentUser?.role === "HR" ? hrLinks : employeeLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              H
            </div>
            <span className="hidden sm:inline">HRMS</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && currentUser && (
            <>
              <Select value={currentUser.id} onValueChange={setCurrentUserId}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} · {u.role === "HR" ? "HR" : "Employee"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {initials(currentUser.name)}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
