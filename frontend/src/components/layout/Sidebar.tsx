'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Tag, BarChart3, LogOut, TrendingUp, X, Target, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import { useBudgetSummary } from '@/hooks/useBudgets';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: Target, badge: 'budgets' },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: budgetSummary } = useBudgetSummary();
  const alertCount = (budgetSummary?.overBudget ?? 0) + (budgetSummary?.nearLimit ?? 0);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={cn(
        'fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-[15px]">FinTracker</span>
          </div>
          <button onClick={onMobileClose} aria-label="Close menu" className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
          <ul className="space-y-0.5" role="list">
            {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              const showAlert = badge === 'budgets' && alertCount > 0;
              return (
                <li key={href}>
                  <Link href={href} onClick={onMobileClose} aria-current={active ? 'page' : undefined} className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}>
                    <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-brand-500' : 'text-slate-400')} />
                    {label}
                    <div className="ml-auto flex items-center gap-1">
                      {showAlert && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                          {alertCount}
                        </span>
                      )}
                      {active && !showAlert && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-slate-100">
          <div className="px-3 pt-3">
            <Link href="/settings" onClick={onMobileClose} className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              pathname === '/settings' ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}>
              <Settings className={cn('h-[18px] w-[18px] shrink-0', pathname === '/settings' ? 'text-brand-500' : 'text-slate-400')} />
              Settings
            </Link>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-3 rounded-xl p-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 text-sm font-bold">
                {getInitials(user?.name ?? 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button onClick={logout} aria-label="Sign out" className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
