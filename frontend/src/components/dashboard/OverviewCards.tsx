'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import type { AnalyticsOverview } from '@/types';

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  subValue?: string;
  subPositive?: boolean;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}

function StatCard({ label, value, subLabel, subValue, subPositive, icon, iconBg, valueColor }: StatCardProps) {
  return (
    <Card className="hover:shadow-card-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', iconBg)}>
          {icon}
        </div>
        {subValue && (
          <div className={cn('flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5', subPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50')}>
            {subPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {subValue}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn('text-2xl font-bold mt-1 tabular-nums', valueColor ?? 'text-slate-900')}>{value}</p>
      {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
    </Card>
  );
}

interface Props {
  data?: AnalyticsOverview;
  isLoading?: boolean;
}

export function OverviewCards({ data, isLoading }: Props) {
  const { format } = useCurrency();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-11 w-11 rounded-2xl mb-3" />
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-8 w-28" />
          </Card>
        ))}
      </div>
    );
  }

  const savingsRate = data?.savingsRate ?? 0;
  const netBalance = data?.netBalance ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Total Income"
        value={format(data?.totalIncome ?? 0)}
        subLabel={`${data?.transactionCount ?? 0} transactions`}
        icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
        iconBg="bg-emerald-50"
        valueColor="text-emerald-600"
      />
      <StatCard
        label="Total Expenses"
        value={format(data?.totalExpenses ?? 0)}
        icon={<TrendingDown className="h-5 w-5 text-red-500" />}
        iconBg="bg-red-50"
        valueColor="text-red-500"
      />
      <StatCard
        label="Net Balance"
        value={format(netBalance)}
        subValue={netBalance >= 0 ? 'Positive' : 'Negative'}
        subPositive={netBalance >= 0}
        icon={<Wallet className="h-5 w-5 text-brand-600" />}
        iconBg="bg-brand-50"
        valueColor={netBalance >= 0 ? 'text-brand-600' : 'text-red-500'}
      />
      <StatCard
        label="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        subValue={savingsRate >= 20 ? 'Great' : savingsRate >= 10 ? 'Fair' : 'Low'}
        subPositive={savingsRate >= 10}
        subLabel="of income saved"
        icon={<PiggyBank className="h-5 w-5 text-purple-600" />}
        iconBg="bg-purple-50"
        valueColor={savingsRate >= 20 ? 'text-purple-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-red-500'}
      />
    </div>
  );
}
