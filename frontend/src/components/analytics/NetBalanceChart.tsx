'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MonthlyData } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  data?: MonthlyData[];
  isLoading?: boolean;
}

export function NetBalanceChart({ data, isLoading }: Props) {
  const { format } = useCurrency();
  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Net Balance by Month</CardTitle>
        <span className="text-xs text-slate-400">Positive = saving, Negative = overspending</span>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} barCategoryGap="35%">
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v >= 0 ? v : `-${Math.abs(v)}`}`}
            />
            <Tooltip
              formatter={(value: number) => [format(Math.abs(value)), value >= 0 ? 'Saved' : 'Overspent']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '13px' }}
            />
            <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1.5} />
            <Bar dataKey="net" radius={[4, 4, 0, 0]}>
              {data?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.net >= 0 ? '#10b981' : '#f43f5e'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
