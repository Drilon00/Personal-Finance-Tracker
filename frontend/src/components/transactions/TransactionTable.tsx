'use client';

import { useState } from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, Repeat, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDate } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { useToast } from '@/contexts/ToastContext';
import type { Transaction, PaginationMeta, TransactionFilters } from '@/types';

interface Props {
  transactions?: Transaction[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  filters: TransactionFilters;
  onFiltersChange: (f: Partial<TransactionFilters>) => void;
  onEdit: (tx: Transaction) => void;
}

export function TransactionTable({
  transactions,
  meta,
  isLoading,
  filters,
  onFiltersChange,
  onEdit,
}: Props) {
  const { format } = useCurrency();
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const deleteTx = useDeleteTransaction();
  const { success, error } = useToast();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTx.mutateAsync(deleteTarget.id);
      success('Transaction deleted', 'The transaction has been removed.');
      setDeleteTarget(null);
    } catch {
      error('Delete failed', 'Could not delete this transaction. Please try again.');
    }
  };

  const toggleSort = (field: 'date' | 'amount' | 'description') => {
    if (filters.sortBy === field) {
      onFiltersChange({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc', page: 1 });
    } else {
      onFiltersChange({ sortBy: field, sortOrder: 'desc', page: 1 });
    }
  };

  const SortBtn = ({ field }: { field: 'date' | 'amount' | 'description' }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`ml-1 p-0.5 rounded transition-colors ${
        filters.sortBy === field ? 'text-brand-500' : 'text-slate-300 hover:text-slate-500'
      }`}
    >
      <ArrowUpDown className="h-3.5 w-3.5" />
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 grid grid-cols-4 gap-3">
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
        <EmptyState
          icon={<ArrowLeftRight className="h-7 w-7" />}
          title="No transactions found"
          description="Try adjusting your filters or add a new transaction to get started."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full hidden md:table">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">
                Description <SortBtn field="description" />
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Type</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                Date <SortBtn field="date" />
              </th>
              <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">
                Amount <SortBtn field="amount" />
              </th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                    {tx.isRecurring && (
                      <span title={`Repeats ${tx.recurringInterval?.toLowerCase() ?? ''}`}>
                        <Repeat className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  {tx.notes && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{tx.notes}</p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: tx.category.color }}
                    />
                    <span className="text-sm text-slate-600">{tx.category.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'} dot>
                    {tx.type === 'INCOME' ? 'Income' : 'Expense'}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-500">
                  {formatDate(tx.date, 'MMM d, yyyy')}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}{format(tx.amount)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="md:hidden divide-y divide-slate-50">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-4">
              <div
                className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: `${tx.category.color}18`, color: tx.category.color }}
              >
                {tx.type === 'INCOME' ? '↑' : '↓'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-slate-900 truncate">{tx.description}</p>
                  {tx.isRecurring && (
                    <span title={`Repeats ${tx.recurringInterval?.toLowerCase() ?? ''}`}>
                      <Repeat className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    </span>
                  )}
                </span>
                <p className="text-xs text-slate-400">
                  {tx.category.name} · {formatDate(tx.date, 'MMM d')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{format(tx.amount)}
                </p>
                <div className="flex gap-1 justify-end mt-1">
                  <button onClick={() => onEdit(tx)} className="p-1 rounded text-slate-400 hover:text-brand-600">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(tx)} className="p-1 rounded text-slate-400 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => onFiltersChange({ page: meta.page - 1 })}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Prev
            </Button>
            <span className="text-sm text-slate-600 px-2">
              {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onFiltersChange({ page: meta.page + 1 })}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteTx.isPending}
        title="Delete transaction?"
        description={`"${deleteTarget?.description}" will be permanently deleted. This action cannot be undone.`}
      />
    </>
  );
}
