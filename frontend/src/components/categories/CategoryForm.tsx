'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import type { Category } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color'),
  icon: z.string().max(50).default('tag'),
});

type FormData = z.infer<typeof schema>;

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6b7280', '#1e293b',
];

interface Props {
  open: boolean;
  onClose: () => void;
  category?: Category;
}

export function CategoryForm({ open, onClose, category }: Props) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { success, error } = useToast();
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', color: '#6366f1', icon: 'tag' },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
        });
      } else {
        reset({ type: 'EXPENSE', color: '#6366f1', icon: 'tag' });
      }
    }
  }, [open, category, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateCategory.mutateAsync({ id: category.id, data });
        success('Category updated');
      } else {
        await createCategory.mutateAsync(data);
        success('Category created', 'Your new category is ready to use.');
      }
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Something went wrong.';
      error(isEditing ? 'Update failed' : 'Create failed', message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'New Category'}
      description={isEditing ? 'Update category details.' : 'Create a custom income or expense category.'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Category name"
          placeholder="e.g. Side Project Income"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        {!isEditing && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Type <span className="text-red-500">*</span></label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FilterDropdown
                  options={[{ value: 'EXPENSE', label: 'Expense' }, { value: 'INCOME', label: 'Income' }]}
                  placeholder="Select type"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Color</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`h-7 w-7 rounded-lg transition-all ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-brand-500 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ background: color }}
              />
            ))}
          </div>
          <Input
            type="color"
            value={selectedColor}
            onChange={(e) => setValue('color', e.target.value)}
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save' : 'Create Category'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
