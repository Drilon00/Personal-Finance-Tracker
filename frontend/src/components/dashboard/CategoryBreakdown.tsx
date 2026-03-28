'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { CategoryBreakdown } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  data?: CategoryBreakdown[];
  isLoading?: boolean;
}

export function CategoryBreakdownChart({ data, isLoading }: Props) {
  const { format } = useCurrency();

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryBreakdown }> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-card-lg border border-slate-100 p-3 text-sm">
        <p className="font-semibold text-slate-900">{d.categoryName}</p>
        <p className="text-slate-500 mt-0.5">{format(d.amount)}</p>
        <p className="text-slate-400 text-xs">{d.percentage}% of total</p>
      </div>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Top Expense Categories</CardTitle>
      </CardHeader>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36 w-36 rounded-full mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={<PieChartIcon className="h-6 w-6" />}
          title="No expense data"
          description="Add some expense transactions to see your category breakdown"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data.slice(0, 6)}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="amount"
              >
                {data.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {data.slice(0, 5).map((item) => (
              <div key={item.categoryId} className="flex items-center gap-2.5">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="flex-1 text-xs text-slate-600 truncate">{item.categoryName}</span>
                <span className="text-xs font-semibold text-slate-900 tabular-nums">
                  {format(item.amount)}
                </span>
                <span className="text-xs text-slate-400 w-9 text-right">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
