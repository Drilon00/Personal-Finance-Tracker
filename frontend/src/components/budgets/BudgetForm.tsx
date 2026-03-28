'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { useCategories } from '@/hooks/useCategories';
import { useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets';
import { useToast } from '@/contexts/ToastContext';
import type { Budget } from '@/types';

const schema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; budget?: Budget }

export function BudgetForm({ open, onClose, budget }: Props) {
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const { success, error } = useToast();
  const isEditing = !!budget;

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { period: 'MONTHLY' },
  });

  useEffect(() => {
    if (open) {
      reset(budget
        ? { categoryId: budget.categoryId, amount: budget.amount, period: budget.period }
        : { period: 'MONTHLY', amount: undefined as unknown as number }
      );
    }
  }, [open, budget, reset]);

  const expenseCategories = categories?.filter(c => c.type === 'EXPENSE').map(c => ({ value: c.id, label: c.name })) ?? [];

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateBudget.mutateAsync({ id: budget.id, amount: data.amount });
        success('Budget updated');
      } else {
        await createBudget.mutateAsync(data);
        success('Budget created', 'Your spending limit has been set.');
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Something went wrong.';
      error(isEditing ? 'Update failed' : 'Create failed', msg);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={isEditing ? 'Edit Budget' : 'New Budget'} description={isEditing ? 'Update your spending limit.' : 'Set a spending limit for an expense category.'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isEditing && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Expense Category <span className="text-red-500">*</span></label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <FilterDropdown options={expenseCategories} placeholder="Select a category" value={field.value ?? ''} onChange={field.onChange} className="w-full" />
                )}
              />
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Period <span className="text-red-500">*</span></label>
              <Controller
                name="period"
                control={control}
                render={({ field }) => (
                  <FilterDropdown
                    options={[{ value: 'WEEKLY', label: 'Weekly' }, { value: 'MONTHLY', label: 'Monthly' }, { value: 'YEARLY', label: 'Yearly' }]}
                    placeholder="Select period"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.period && <p className="text-xs text-red-500">{errors.period.message}</p>}
            </div>
          </>
        )}
        <Input label="Budget Amount" type="number" step="0.01" min="0.01" placeholder="0.00" required leftElement={<DollarSign className="h-4 w-4" />} error={errors.amount?.message} {...register('amount')} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEditing ? 'Save' : 'Create Budget'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
