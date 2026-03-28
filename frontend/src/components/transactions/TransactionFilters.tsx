'use client';

import { useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { debounce } from '@/lib/utils';
import type { TransactionFilters } from '@/types';

interface Props {
  filters: TransactionFilters;
  onChange: (filters: Partial<TransactionFilters>) => void;
}

export function TransactionFiltersBar({ filters, onChange }: Props) {
  const { data: categories } = useCategories();

  const hasActiveFilters =
    filters.type || filters.categoryId || filters.search || filters.startDate || filters.endDate;

  const handleSearch = useCallback(
    debounce((value: string) => onChange({ search: value || undefined, page: 1 }), 350),
    [onChange]
  );

  const clearFilters = () => {
    onChange({ type: undefined, categoryId: undefined, search: undefined, startDate: undefined, endDate: undefined, page: 1 });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="text-sm font-medium text-slate-600">Filters</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={clearFilters}
          leftIcon={<X className="h-3.5 w-3.5" />}
          className={!hasActiveFilters ? 'invisible' : ''}
        >
          Clear all
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            defaultValue={filters.search ?? ''}
            onChange={(e) => handleSearch(e.target.value)}
            leftElement={<Search className="h-4 w-4" />}
          />
        </div>

        <FilterDropdown
          options={[
            { value: 'INCOME', label: 'Income' },
            { value: 'EXPENSE', label: 'Expense' },
          ]}
          placeholder="All types"
          value={filters.type ?? ''}
          onChange={(val) => onChange({ type: (val as TransactionFilters['type']) || undefined, page: 1 })}
        />

        <FilterDropdown
          options={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
          placeholder="All categories"
          value={filters.categoryId ?? ''}
          onChange={(val) => onChange({ categoryId: val || undefined, page: 1 })}
        />

        <Input
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) => onChange({ startDate: e.target.value || undefined, page: 1 })}
          className="sm:w-36"
        />

        <Input
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) => onChange({ endDate: e.target.value || undefined, page: 1 })}
          className="sm:w-36"
        />
      </div>
    </div>
  );
}
