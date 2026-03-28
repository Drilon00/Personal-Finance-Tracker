'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { NotificationsDropdown } from './NotificationsDropdown';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/analytics': 'Analytics',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
};

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'FinTracker';

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-100 bg-white/90 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationsDropdown />
      </div>
    </header>
  );
}
