import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '@/lib/api';
import type { Budget, BudgetSummary, CreateBudgetInput } from '@/types';

export const BUDGETS_KEY = 'budgets';

export function useBudgets() {
  return useQuery({
    queryKey: [BUDGETS_KEY],
    queryFn: async (): Promise<Budget[]> => {
      const res = await budgetsApi.list();
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useBudgetSummary() {
  return useQuery({
    queryKey: [BUDGETS_KEY, 'summary'],
    queryFn: async (): Promise<BudgetSummary> => {
      const res = await budgetsApi.summary();
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetsApi.create(data as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUDGETS_KEY] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      budgetsApi.update(id, { amount }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUDGETS_KEY] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUDGETS_KEY] }),
  });
}
