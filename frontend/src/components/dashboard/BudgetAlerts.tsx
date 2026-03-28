'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import type { Budget } from '@/types';

interface Props {
  budgets?: Budget[];
  isLoading?: boolean;
}

export function BudgetAlerts({ budgets, isLoading }: Props) {
  const { format } = useCurrency();
  const alerts = budgets?.filter(b => b.percentage >= 75).sort((a, b) => b.percentage - a.percentage) ?? [];

  if (!isLoading && alerts.length === 0) return null;

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Budget Alerts
        </CardTitle>
        <Link href="/budgets" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
          All budgets <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.slice(0, 5).map(b => (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: b.category.color }} />
                  <span className="text-sm font-medium text-slate-700">{b.category.name}</span>
                </div>
                <div className="text-right">
                  <span className={cn('text-xs font-semibold tabular-nums', b.isOverBudget ? 'text-red-600' : 'text-amber-600')}>
                    {format(b.spent)}
                  </span>
                  <span className="text-xs text-slate-400"> / {format(b.amount)}</span>
                </div>
              </div>
              <Progress value={b.percentage} size="sm" />
              <p className={cn('text-[10px] mt-1 font-medium', b.isOverBudget ? 'text-red-500' : 'text-amber-500')}>
                {b.isOverBudget
                  ? `${format(b.spent - b.amount)} over limit`
                  : `${b.percentage.toFixed(0)}% used — ${format(b.remaining)} left`}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
