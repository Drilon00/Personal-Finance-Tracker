'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBudgets } from '@/hooks/useBudgets';
import type { Budget } from '@/types';

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: budgets } = useBudgets();

  const overBudget: Budget[] = (budgets ?? []).filter((b: Budget) => b.isOverBudget);
  const nearLimit: Budget[] = (budgets ?? []).filter(
    (b: Budget) => !b.isOverBudget && b.percentage >= 75
  );

  const notifications = [
    ...overBudget.map((b: Budget) => ({ budget: b, kind: 'over' as const })),
    ...nearLimit.map((b: Budget) => ({ budget: b, kind: 'near' as const })),
  ];

  const count = notifications.length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
                <p className="text-sm font-medium text-slate-600">All budgets on track</p>
                <p className="text-xs">No alerts right now.</p>
              </div>
            ) : (
              <ul>
                {notifications.map(({ budget, kind }) => (
                  <li key={budget.id}>
                    <button
                      onClick={() => {
                        router.push('/budgets');
                        setOpen(false);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base ${
                          kind === 'over'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {budget.category.icon ?? (kind === 'over' ? '🚨' : '⚠️')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {budget.category.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {kind === 'over' ? (
                            <span className="text-red-600 font-medium">Over budget</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Near limit</span>
                          )}{' '}
                          — {budget.percentage.toFixed(0)}% of budget used
                        </p>
                      </div>
                      {kind === 'over' ? (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 shrink-0 text-amber-500 mt-1" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5">
              <button
                onClick={() => {
                  router.push('/budgets');
                  setOpen(false);
                }}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all budgets →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
