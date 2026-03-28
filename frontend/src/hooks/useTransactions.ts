import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import type { Transaction, TransactionFilters, CreateTransactionInput, PaginationMeta } from '@/types';

interface TransactionPage {
  transactions: Transaction[];
  meta: PaginationMeta;
}

export const TRANSACTIONS_KEY = 'transactions';

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [TRANSACTIONS_KEY, filters],
    queryFn: async () => {
      const res = await transactionsApi.list(filters as Record<string, unknown>);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      transactionsApi.create(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionInput> }) =>
      transactionsApi.update(id, data as Record<string, unknown>),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [TRANSACTIONS_KEY] });
      const snapshots = queryClient.getQueriesData<{ data: TransactionPage }>({
        queryKey: [TRANSACTIONS_KEY],
      });
      queryClient.setQueriesData<{ data: TransactionPage }>(
        { queryKey: [TRANSACTIONS_KEY] },
        (old) => {
          if (!old?.data?.transactions) return old;
          return {
            ...old,
            data: {
              ...old.data,
              transactions: old.data.transactions.map((tx) =>
                tx.id === id ? { ...tx, ...data } : tx
              ),
            },
          };
        }
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [TRANSACTIONS_KEY] });
      const snapshots = queryClient.getQueriesData<{ data: TransactionPage }>({
        queryKey: [TRANSACTIONS_KEY],
      });
      queryClient.setQueriesData<{ data: TransactionPage }>(
        { queryKey: [TRANSACTIONS_KEY] },
        (old) => {
          if (!old?.data?.transactions) return old;
          return {
            ...old,
            data: {
              ...old.data,
              transactions: old.data.transactions.filter((tx) => tx.id !== id),
              meta: old.data.meta
                ? { ...old.data.meta, total: Math.max(0, old.data.meta.total - 1) }
                : old.data.meta,
            },
          };
        }
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
