'use client';

import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, LayoutDashboard, LogOut, ShieldAlert, User, Loader2, UserPlus } from 'lucide-react';

export default function AttendanceLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/attendance', label: 'My Dashboard', icon: LayoutDashboard },
    ...(user.role === 'ADMIN' || user.role === 'HR' ? [
      { href: '/admin/attendance', label: 'Admin Panel', icon: ShieldAlert },
      { href: '/admin/employees/create', label: 'Onboard Employee', icon: UserPlus }
    ] : []),
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            HRMS Portal
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800 tracking-tight">HRMS</span>
          </div>

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

        {/* Dynamic page contents */}
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}
