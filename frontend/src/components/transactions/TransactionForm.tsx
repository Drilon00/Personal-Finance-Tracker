'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, FileText, Calendar, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useToast } from '@/contexts/ToastContext';
import { formatDateInput } from '@/lib/utils';
import type { Transaction, Category } from '@/types';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(255),
  notes: z.string().max(1000).optional(),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Category is required'),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
}

export function TransactionForm({ open, onClose, transaction }: Props) {
  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const { success, error } = useToast();
  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'EXPENSE',
      date: formatDateInput(new Date()),
    },
  });

  const selectedType = watch('type');
  const isRecurring = watch('isRecurring');

  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          type: transaction.type,
          amount: Number(transaction.amount),
          description: transaction.description,
          notes: transaction.notes ?? '',
          date: formatDateInput(transaction.date),
          categoryId: transaction.categoryId,
          isRecurring: transaction.isRecurring,
          recurringInterval: transaction.recurringInterval,
        });
      } else {
        reset({ type: 'EXPENSE', date: formatDateInput(new Date()), amount: undefined as unknown as number, isRecurring: false });
      }
    }
  }, [open, transaction, reset]);

  useEffect(() => {
    if (!transaction) {
      setValue('categoryId', '');
    }
  }, [selectedType, setValue, transaction]);

  const filteredCategories =
    categories?.filter((c: Category) => c.type === selectedType).map((c: Category) => ({
      value: c.id,
      label: c.name,
    })) ?? [];

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateTx.mutateAsync({ id: transaction.id, data });
        success('Transaction updated', 'Your changes have been saved.');
      } else {
        await createTx.mutateAsync(data);
        success('Transaction added', 'Your transaction has been recorded.');
      }
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Something went wrong. Please try again.';
      error(isEditing ? 'Update failed' : 'Failed to add transaction', message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
      description={isEditing ? 'Update the transaction details below.' : 'Record a new income or expense transaction.'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex rounded-xl border border-slate-200 p-1 gap-1">
          {(['EXPENSE', 'INCOME'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('type', type)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                selectedType === type
                  ? type === 'INCOME'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'INCOME' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            leftElement={<DollarSign className="h-4 w-4" />}
            error={errors.amount?.message}
            {...register('amount')}
          />
          <Input
            label="Date"
            type="date"
            required
            leftElement={<Calendar className="h-4 w-4" />}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        <Input
          label="Description"
          type="text"
          placeholder={selectedType === 'INCOME' ? 'e.g. Monthly Salary' : 'e.g. Grocery Shopping'}
          required
          leftElement={<FileText className="h-4 w-4" />}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <FilterDropdown
                options={filteredCategories}
                placeholder="Select a category"
                value={field.value ?? ''}
                onChange={field.onChange}
                className="w-full"
              />
            )}
          />
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="Any additional details..."
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="rounded-xl border border-slate-200 p-3 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('isRecurring')}
              />
              <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Repeat className="h-4 w-4 text-slate-400" />
              Recurring transaction
            </span>
          </label>
          {isRecurring && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Repeat every <span className="text-red-500">*</span>
              </label>
              <Controller
                name="recurringInterval"
                control={control}
                render={({ field }) => (
                  <FilterDropdown
                    options={[
                      { value: 'DAILY', label: 'Day' },
                      { value: 'WEEKLY', label: 'Week' },
                      { value: 'MONTHLY', label: 'Month' },
                      { value: 'YEARLY', label: 'Year' },
                    ]}
                    placeholder="Select interval"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.recurringInterval && <p className="text-xs text-red-500">{errors.recurringInterval.message}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
