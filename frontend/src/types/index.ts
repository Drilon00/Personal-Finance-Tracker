export type TransactionType = 'INCOME' | 'EXPENSE';
export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type RecurringInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
  userId: string;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: string | number;
  type: TransactionType;
  description: string;
  notes?: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  userId: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon' | 'type'>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'description';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface AnalyticsOverview {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
}

export interface MonthlyData {
  label: string;
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailyTrend {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface Budget {
  id: string;
  amount: number;
  period: BudgetPeriod;
  userId: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon' | 'type'>;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  total: number;
  overBudget: number;
  nearLimit: number;
  totalBudgeted: number;
  totalSpent: number;
  budgets: Budget[];
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  description: string;
  notes?: string;
  date: string;
  categoryId: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface CreateBudgetInput {
  amount: number;
  period: BudgetPeriod;
  categoryId: string;
}
