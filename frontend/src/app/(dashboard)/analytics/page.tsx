'use client';

import { useState } from 'react';
import { useAnalyticsOverview, useMonthlyBreakdown, useCategoryBreakdown } from '@/hooks/useAnalytics';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { MonthlyTrendChart } from '@/components/analytics/MonthlyTrendChart';
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart';
import { NetBalanceChart } from '@/components/analytics/NetBalanceChart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

const PERIODS = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '12M', months: 12 },
  { label: '24M', months: 24 },
];

export default function AnalyticsPage() {
  const { format } = useCurrency();
  const [months, setMonths] = useState(12);
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyBreakdown(months);
  const { data: categoryData, isLoading: catLoading } = useCategoryBreakdown(categoryType);
  const { data: expenseCategories, isLoading: expenseCatLoading } = useCategoryBreakdown('EXPENSE');
  const { data: incomeCategories, isLoading: incomeCatLoading } = useCategoryBreakdown('INCOME');

  const avgIncome = (overview?.totalIncome ?? 0) / months;
  const avgExpense = (overview?.totalExpenses ?? 0) / months;
  const savingsRate = overview?.savingsRate ?? 0;

  const summaryStats = [
    { label: 'Avg Monthly Income', value: format(avgIncome), color: 'text-emerald-600' },
    { label: 'Avg Monthly Expense', value: format(avgExpense), color: 'text-red-500' },
    { label: 'Avg Monthly Savings', value: format(avgIncome - avgExpense), color: avgIncome >= avgExpense ? 'text-brand-600' : 'text-red-500' },
    { label: 'Total Transactions', value: (overview?.transactionCount ?? 0).toString(), color: 'text-slate-900' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Financial Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Deep insights into your financial health</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {PERIODS.map(opt => (
            <Button
              key={opt.label}
              variant={months === opt.months ? 'primary' : 'ghost'}
              size="xs"
              onClick={() => setMonths(opt.months)}
              className={months !== opt.months ? 'text-slate-500' : ''}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <OverviewCards data={overview} isLoading={overviewLoading} />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => <Card key={i} className="text-center"><Skeleton className="h-4 w-24 mx-auto mb-2" /><Skeleton className="h-7 w-28 mx-auto" /></Card>)
          : summaryStats.map(s => (
            <Card key={s.label} className="text-center">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={cn('text-xl font-bold mt-1 tabular-nums', s.color)}>{s.value}</p>
            </Card>
          ))
        }
      </div>

      {/* Trend + Net balance */}
      <MonthlyTrendChart data={monthly} isLoading={monthlyLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <NetBalanceChart data={monthly} isLoading={monthlyLoading} />

        {/* Savings rate gauge */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Savings Rate</h3>
              <p className="text-xs text-slate-500 mt-0.5">Percentage of income kept</p>
            </div>
            {overviewLoading
              ? <Skeleton className="h-10 w-20" />
              : <p className={cn('text-4xl font-black tabular-nums', savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-amber-500' : 'text-red-500')}>
                  {savingsRate.toFixed(1)}%
                </p>
            }
          </div>
          {!overviewLoading && (
            <>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className={cn('h-4 rounded-full transition-all duration-700 relative', savingsRate >= 20 ? 'bg-emerald-500' : savingsRate >= 0 ? 'bg-amber-400' : 'bg-red-500')}
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-slate-400">0%</span>
                <span className={cn('font-semibold', savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 10 ? 'text-amber-600' : 'text-red-500')}>
                  {savingsRate >= 20 ? '🎉 Excellent saving habit!' : savingsRate >= 10 ? '👍 Room for improvement' : savingsRate >= 0 ? '⚠️ Try to save more' : '🚨 Spending exceeds income!'}
                </span>
                <span className="text-slate-400">100%</span>
              </div>

              {/* Benchmark ticks */}
              <div className="mt-4 space-y-1.5">
                {[{ pct: 10, label: 'Minimum recommended' }, { pct: 20, label: 'Financial experts suggest' }, { pct: 50, label: '50/30/20 rule savings target' }].map(b => (
                  <div key={b.pct} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={cn('font-semibold w-8', savingsRate >= b.pct ? 'text-emerald-500' : 'text-slate-300')}>{b.pct}%</span>
                    <span>{b.label}</span>
                    {savingsRate >= b.pct && <span className="text-emerald-500 font-semibold ml-auto">✓</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Category breakdown with toggle */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">Category Breakdown</h3>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(['EXPENSE', 'INCOME'] as const).map(type => (
              <Button key={type} variant={categoryType === type ? 'primary' : 'ghost'} size="xs" onClick={() => setCategoryType(type)} className={categoryType !== type ? 'text-slate-500' : ''}>
                {type === 'EXPENSE' ? 'Expenses' : 'Income'}
              </Button>
            ))}
          </div>
        </div>
        <CategoryPieChart data={categoryData} isLoading={catLoading} />
      </Card>

      {/* Side-by-side income vs expense sources */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CategoryPieChart data={expenseCategories} title="Top Expenses" isLoading={expenseCatLoading} />
        <CategoryPieChart data={incomeCategories} title="Income Sources" isLoading={incomeCatLoading} />
      </div>
    </div>
  );
}
