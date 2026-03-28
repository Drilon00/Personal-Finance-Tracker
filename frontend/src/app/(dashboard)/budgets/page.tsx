'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { useBudgets, useDeleteBudget } from '@/hooks/useBudgets';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import type { Budget } from '@/types';

export default function BudgetsPage() {
  const { format } = useCurrency();
  const { data: budgets, isLoading } = useBudgets();
  const deleteBudget = useDeleteBudget();
  const { success, error } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

  const overBudget = budgets?.filter(b => b.isOverBudget) ?? [];
  const nearLimit = budgets?.filter(b => !b.isOverBudget && b.percentage >= 80) ?? [];
  const onTrack = budgets?.filter(b => b.percentage < 80) ?? [];
  const totalBudgeted = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;

  const openEdit = (b: Budget) => { setEditingBudget(b); setFormOpen(true); };
  const handleFormClose = () => { setFormOpen(false); setEditingBudget(undefined); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBudget.mutateAsync(deleteTarget.id);
      success('Budget removed');
      setDeleteTarget(null);
    } catch {
      error('Delete failed', 'Could not remove this budget.');
    }
  };

  const SummaryCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: ReactNode; color: string }) => (
    <Card className={cn('flex items-center gap-3', color)}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs font-medium opacity-80 mt-0.5">{label}</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Budgets</h2>
          <p className="text-sm text-slate-500 mt-0.5">Set spending limits and track them in real-time</p>
        </div>
        {(budgets?.length ?? 0) > 0 && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
            New Budget
          </Button>
        )}
      </div>

      {!isLoading && (budgets?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Total Budgeted" value={format(totalBudgeted)} icon={<Target className="h-8 w-8 text-brand-400" />} color="text-brand-700" />
          <SummaryCard label="Total Spent" value={format(totalSpent)} icon={<TrendingDown className="h-8 w-8 text-slate-400" />} color="text-slate-700" />
          <SummaryCard label="Over Budget" value={overBudget.length} icon={<AlertTriangle className="h-8 w-8 text-red-400" />} color="text-red-700" />
          <SummaryCard label="On Track" value={onTrack.length} icon={<CheckCircle className="h-8 w-8 text-emerald-400" />} color="text-emerald-700" />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : !budgets?.length ? (
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="No budgets set"
          description="Create spending limits for your expense categories to stay on track."
          action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>Create your first budget</Button>}
        />
      ) : (
        <div className="space-y-6">
          {overBudget.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Over Budget ({overBudget.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {overBudget.map(b => <BudgetCard key={b.id} budget={b} onEdit={openEdit} onDelete={setDeleteTarget} />)}
              </div>
            </div>
          )}
          {nearLimit.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Approaching Limit ({nearLimit.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {nearLimit.map(b => <BudgetCard key={b.id} budget={b} onEdit={openEdit} onDelete={setDeleteTarget} />)}
              </div>
            </div>
          )}
          {onTrack.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> On Track ({onTrack.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {onTrack.map(b => <BudgetCard key={b.id} budget={b} onEdit={openEdit} onDelete={setDeleteTarget} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <BudgetForm open={formOpen} onClose={handleFormClose} budget={editingBudget} />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteBudget.isPending} title="Remove budget?" description={`The spending limit for "${deleteTarget?.category.name}" will be removed.`} confirmLabel="Remove" />
    </div>
  );
}
