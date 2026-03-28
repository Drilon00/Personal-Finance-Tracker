import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'success' | 'warning' | 'danger';
}

const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

const colors: Record<string, string> = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-400',
  danger: 'bg-red-500',
};

export function Progress({
  value,
  className,
  barClassName,
  size = 'md',
  color = 'brand',
}: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const autoColor =
    color === 'brand'
      ? clamped >= 100
        ? 'danger'
        : clamped >= 80
        ? 'warning'
        : 'success'
      : color;

  return (
    <div className={cn('w-full rounded-full bg-slate-100 overflow-hidden', sizes[size], className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[autoColor], barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
