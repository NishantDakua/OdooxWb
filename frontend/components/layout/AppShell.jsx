'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Shield, UserPlus, CalendarCheck, CalendarDays, User, LogOut, Loader2,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

const NAV = [
  { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/admin', label: 'Admin Panel', icon: Shield, roles: ['ADMIN', 'HR'] },
  { href: '/onboard', label: 'Onboard Employee', icon: UserPlus, roles: ['ADMIN', 'HR'] },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/leave', label: 'Leave / Time Off', icon: CalendarDays },
  { href: '/profile', label: 'My Profile', icon: User },
];

const TITLES = {
  '/dashboard': 'My Dashboard',
  '/admin': 'Admin Panel',
  '/onboard': 'Onboard Employee',
  '/attendance': 'Attendance',
  '/leave': 'Leave / Time Off',
  '/profile': 'My Profile',
};

export function AppShell({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Consume the existing auth session — bounce to the real login if absent.
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const pageTitle = TITLES[pathname] || 'HRMS';
  const links = NAV.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 fixed inset-y-0 left-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6" />
            HRMS Portal
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <span className="text-lg font-bold text-slate-800 tracking-tight">{pageTitle}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <User className="w-4 h-4 text-slate-400" />
              <span>Hi, <strong className="text-slate-800 font-semibold">{user.name}</strong></span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-transparent hover:border-rose-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-grow">{children}</main>
      </div>
    </div>
  );
}
