import type { Transaction } from '@/types';
import { formatDate } from './utils';

export function exportTransactionsToCSV(transactions: Transaction[], filename = 'transactions.csv') {
  const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Notes'];

  const rows = transactions.map(tx => [
    formatDate(tx.date, 'yyyy-MM-dd'),
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.type,
    `"${tx.category.name}"`,
    Number(tx.amount).toFixed(2),
    tx.notes ? `"${tx.notes.replace(/"/g, '""')}"` : '',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
