'use client';

import { Edit2, Trash2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import type { Budget } from '@/types';

interface Props {
  budget: Budget;
  onEdit: (b: Budget) => void;
  onDelete: (b: Budget) => void;
}

const PERIOD_LABELS = { WEEKLY: 'Weekly', MONTHLY: 'Monthly', YEARLY: 'Yearly' };

export function BudgetCard({ budget, onEdit, onDelete }: Props) {
  const { format } = useCurrency();
  const statusColor = budget.isOverBudget ? 'text-red-600' : budget.percentage >= 80 ? 'text-amber-600' : 'text-emerald-600';
  const statusLabel = budget.isOverBudget ? 'Over budget' : budget.percentage >= 80 ? 'Near limit' : 'On track';
  const statusVariant = budget.isOverBudget ? 'danger' : budget.percentage >= 80 ? 'warning' : 'success';

  return (
    <div className={cn(
      'group relative bg-white rounded-2xl border p-5 shadow-card transition-all duration-200 hover:shadow-card-md',
      budget.isOverBudget ? 'border-red-200' : budget.percentage >= 80 ? 'border-amber-200' : 'border-slate-100'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${budget.category.color}18` }}>
            {budget.isOverBudget
              ? <AlertTriangle className="h-5 w-5 text-red-500" />
              : <TrendingUp className="h-5 w-5" style={{ color: budget.category.color }} />
            }
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{budget.category.name}</p>
            <Badge variant="default" className="mt-0.5 text-[10px]">{PERIOD_LABELS[budget.period]}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(budget)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
          <button onClick={() => onDelete(budget)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className={cn('font-semibold', statusColor)}>
            {format(budget.spent)} spent
          </span>
          <span className="text-slate-400">of {format(budget.amount)}</span>
        </div>
        <Progress value={budget.percentage} size="lg" />
        <div className="flex items-center justify-between">
          <Badge variant={statusVariant} dot>{statusLabel}</Badge>
          <span className="text-xs text-slate-500 tabular-nums">
            {budget.isOverBudget
              ? `${format(budget.spent - budget.amount)} over`
              : `${format(budget.remaining)} left`}
          </span>
        </div>
      </div>
    </div>
  );
}
