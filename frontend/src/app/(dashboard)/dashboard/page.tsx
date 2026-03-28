'use client';

import { useAnalyticsOverview, useMonthlyBreakdown, useCategoryBreakdown } from '@/hooks/useAnalytics';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdown';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { BudgetAlerts } from '@/components/dashboard/BudgetAlerts';
import { useAuth } from '@/contexts/AuthContext';
import { SectionErrorBoundary } from '@/components/ui/section-error-boundary';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyBreakdown(6);
  const { data: categories, isLoading: categoriesLoading } = useCategoryBreakdown('EXPENSE');
  const { data: recentTxData, isLoading: txLoading } = useTransactions({ limit: 8, sortBy: 'date', sortOrder: 'desc' });
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const alertBudgets = budgets?.filter((b: { percentage: number }) => b.percentage >= 75) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-1">Here&apos;s your financial snapshot for this month.</p>
      </div>

      <SectionErrorBoundary label="Overview cards">
        <OverviewCards data={overview} isLoading={overviewLoading} />
      </SectionErrorBoundary>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SectionErrorBoundary label="Spending chart">
            <SpendingChart data={monthly} isLoading={monthlyLoading} />
          </SectionErrorBoundary>
        </div>
        <SectionErrorBoundary label="Category breakdown">
          <CategoryBreakdownChart data={categories} isLoading={categoriesLoading} />
        </SectionErrorBoundary>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SectionErrorBoundary label="Recent transactions">
            <RecentTransactions data={recentTxData?.data} isLoading={txLoading} />
          </SectionErrorBoundary>
        </div>
        <SectionErrorBoundary label="Budget alerts">
          <BudgetAlerts budgets={alertBudgets} isLoading={budgetsLoading} />
        </SectionErrorBoundary>
      </div>
    </div>
  );
}
