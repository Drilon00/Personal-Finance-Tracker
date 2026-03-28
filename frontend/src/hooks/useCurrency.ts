import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

export function useCurrency() {
  const { user } = useAuth();
  const currency = user?.currency ?? 'USD';

  return {
    currency,
    format: (amount: number | string) => formatCurrency(amount, currency),
  };
}
