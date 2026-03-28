'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { ArrowLeftRight } from 'lucide-react';
import type { Transaction } from '@/types';

interface Props {
  data?: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ data, isLoading }: Props) {
  const { format } = useCurrency();
  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-32 mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={<ArrowLeftRight className="h-6 w-6" />}
          title="No transactions yet"
          description="Add your first income or expense transaction to get started"
        />
      ) : (
        <div className="space-y-1">
          {data.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors cursor-default"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm"
                style={{ background: `${tx.category.color}18` }}
              >
                <span style={{ color: tx.category.color }}>
                  {tx.type === 'INCOME' ? '↑' : '↓'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{tx.description}</p>
                <p className="text-xs text-slate-400">
                  {tx.category.name} · {formatDate(tx.date, 'MMM d')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}{format(tx.amount)}
                </p>
                <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'} className="mt-0.5">
                  {tx.type === 'INCOME' ? 'Income' : 'Expense'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
