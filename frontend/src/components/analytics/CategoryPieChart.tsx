'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { CategoryBreakdown } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: CategoryBreakdown;
  percent: number;
  value: number;
}

interface Props {
  data?: CategoryBreakdown[];
  title?: string;
  isLoading?: boolean;
}

export function CategoryPieChart({ data, title = 'Category Breakdown', isLoading }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { format } = useCurrency();

  function ActiveShape(props: ActiveShapeProps) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
      <g>
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#1e293b" className="text-sm font-semibold" fontSize={13}>
          {payload.categoryName}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize={12}>
          {format(value)}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill="#94a3b8" fontSize={11}>
          {payload.percentage}%
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 12} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      </g>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.length ? (
        <EmptyState
          icon={<PieChartIcon className="h-6 w-6" />}
          title="No data available"
          description="Add some transactions to see the breakdown"
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-center overflow-hidden">
          <ResponsiveContainer width="100%" height={240} className="shrink-0 max-w-xs">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={ActiveShape as unknown as React.ReactElement}
                data={data.slice(0, 8)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                dataKey="amount"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {data.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [format(value), 'Amount']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '13px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 min-w-0 w-full space-y-2">
            {data.slice(0, 8).map((item, i) => (
              <div
                key={item.categoryId}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  activeIndex === i ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className="h-3 w-3 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="flex-1 text-sm text-slate-600 truncate">{item.categoryName}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-900">{format(item.amount)}</span>
                <span className="text-xs text-slate-400 w-12 text-right">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
