'use client';

import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransactionFiltersBar } from '@/components/transactions/TransactionFilters';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { exportTransactionsToCSV } from '@/lib/csv';
import { useToast } from '@/contexts/ToastContext';
import type { Transaction, TransactionFilters } from '@/types';

const DEFAULT_FILTERS: TransactionFilters = {
  page: 1,
  limit: 20,
  sortBy: 'date',
  sortOrder: 'desc',
};

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();
  const { data, isLoading } = useTransactions(filters);
  const { info } = useToast();

  // Fetch all for export (no pagination)
  const { data: allData } = useTransactions({ ...filters, page: 1, limit: 500 });

  const updateFilters = (updates: Partial<TransactionFilters>) =>
    setFilters(prev => ({ ...prev, ...updates }));

  const openEdit = (tx: Transaction) => { setEditingTx(tx); setFormOpen(true); };
  const handleFormClose = () => { setFormOpen(false); setEditingTx(undefined); };

  const handleExport = () => {
    const txs = allData?.data ?? [];
    if (!txs.length) { info('Nothing to export', 'No transactions match the current filters.'); return; }
    exportTransactionsToCSV(txs, `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">All Transactions</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {data?.meta ? `${data.meta.total} transaction${data.meta.total !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport} className="hidden sm:flex">
            Export CSV
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <TransactionFiltersBar filters={filters} onChange={updateFilters} />
      </Card>

      <TransactionTable
        transactions={data?.data}
        meta={data?.meta}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={updateFilters}
        onEdit={openEdit}
      />

      <TransactionForm open={formOpen} onClose={handleFormClose} transaction={editingTx} />
    </div>
  );
}
