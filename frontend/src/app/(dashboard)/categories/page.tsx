'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const { success, error } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const incomeCategories = categories?.filter((c) => c.type === 'INCOME') ?? [];
  const expenseCategories = categories?.filter((c) => c.type === 'EXPENSE') ?? [];

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      success('Category deleted');
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not delete this category.';
      error('Delete failed', message);
    }
  };

  const CategoryCard = ({ cat }: { cat: Category }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group bg-white">
      <div
        className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-lg"
        style={{ background: `${cat.color}18` }}
      >
        <span style={{ color: cat.color }}>●</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{cat.name}</p>
        <p className="text-xs text-slate-400">
          {cat.transactionCount ?? 0} transaction{(cat.transactionCount ?? 0) !== 1 ? 's' : ''}
          {cat.isDefault && ' · Default'}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => openEdit(cat)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        {!cat.isDefault && (
          <button
            onClick={() => setDeleteTarget(cat)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize your transactions with custom categories
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Income Categories</h3>
              <Badge variant="income">{incomeCategories.length}</Badge>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : incomeCategories.length === 0 ? (
            <EmptyState
              icon={<Tag className="h-5 w-5" />}
              title="No income categories"
              description="Create a category to organize your income"
            />
          ) : (
            <div className="space-y-2">
              {incomeCategories.map((cat) => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Expense Categories</h3>
              <Badge variant="expense">{expenseCategories.length}</Badge>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : expenseCategories.length === 0 ? (
            <EmptyState
              icon={<Tag className="h-5 w-5" />}
              title="No expense categories"
              description="Create a category to organize your expenses"
            />
          ) : (
            <div className="space-y-2">
              {expenseCategories.map((cat) => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <CategoryForm open={formOpen} onClose={handleFormClose} category={editingCategory} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteCategory.isPending}
        title="Delete category?"
        description={`"${deleteTarget?.name}" will be deleted. Transactions using this category cannot be deleted if they still reference it.`}
      />
    </div>
  );
}
