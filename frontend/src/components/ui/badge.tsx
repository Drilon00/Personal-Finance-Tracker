import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'income' | 'expense' | 'default' | 'success' | 'warning' | 'danger' | 'info';

const variants: Record<BadgeVariant, string> = {
  income: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  expense: 'bg-red-50 text-red-700 border-red-100',
  default: 'bg-slate-50 text-slate-600 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ variant = 'default', dot, children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'income' || variant === 'success' ? 'bg-emerald-500' :
            variant === 'expense' || variant === 'danger' ? 'bg-red-500' :
            variant === 'warning' ? 'bg-amber-500' :
            variant === 'info' ? 'bg-blue-500' : 'bg-slate-400'
          )}
        />
      )}
      {children}
    </span>
  );
}
