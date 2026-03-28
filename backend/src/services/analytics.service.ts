import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  months?: number;
}

function getDateRange(params: AnalyticsQueryParams): { start: Date; end: Date } {
  const end = params.endDate ? new Date(`${params.endDate}T23:59:59.999Z`) : new Date();
  const months = params.months ?? 12;
  const start = params.startDate
    ? new Date(params.startDate)
    : new Date(end.getFullYear(), end.getMonth() - months + 1, 1);
  return { start, end };
}

export async function getOverview(userId: string, params: AnalyticsQueryParams) {
  const { start, end } = getDateRange(params);

  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true },
    _count: { _all: true },
  });

  const incomeData = result.find((r) => r.type === 'INCOME');
  const expenseData = result.find((r) => r.type === 'EXPENSE');

  const totalIncome = Number(incomeData?._sum.amount ?? 0);
  const totalExpenses = Number(expenseData?._sum.amount ?? 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const transactionCount = (incomeData?._count._all ?? 0) + (expenseData?._count._all ?? 0);

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate: Math.round(savingsRate * 10) / 10,
    transactionCount,
  };
}

export async function getMonthlyBreakdown(userId: string, months = 12) {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1);

  const rows = await prisma.$queryRaw<
    Array<{ year: number; month: number; type: string; total: Prisma.Decimal }>
  >`
    SELECT
      EXTRACT(YEAR FROM date)::int AS year,
      EXTRACT(MONTH FROM date)::int AS month,
      type,
      SUM(amount) AS total
    FROM "Transaction"
    WHERE "userId" = ${userId}
      AND date >= ${start}
      AND date <= ${end}
    GROUP BY year, month, type
    ORDER BY year ASC, month ASC
  `;

  const monthMap = new Map<string, { year: number; month: number; income: number; expenses: number }>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthMap.set(key, { year: d.getFullYear(), month: d.getMonth() + 1, income: 0, expenses: 0 });
  }

  for (const row of rows) {
    const key = `${row.year}-${row.month}`;
    const entry = monthMap.get(key);
    if (entry) {
      if (row.type === 'INCOME') entry.income = Number(row.total);
      else entry.expenses = Number(row.total);
    }
  }

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Array.from(monthMap.values()).map((m) => ({
    label: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
    month: MONTH_NAMES[m.month - 1],
    year: m.year,
    income: m.income,
    expenses: m.expenses,
    net: m.income - m.expenses,
  }));
}

export async function getCategoryBreakdown(userId: string, type: 'INCOME' | 'EXPENSE', params: AnalyticsQueryParams) {
  const { start, end } = getDateRange(params);

  const rows = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type, date: { gte: start, lte: end } },
    _sum: { amount: true },
    _count: { _all: true },
  });

  if (rows.length === 0) return [];

  const categoryIds = rows.map((r) => r.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true, icon: true },
  });

  const total = rows.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return rows
    .map((row) => {
      const cat = categoryMap.get(row.categoryId);
      const amount = Number(row._sum.amount ?? 0);
      return {
        categoryId: row.categoryId,
        categoryName: cat?.name ?? 'Unknown',
        color: cat?.color ?? '#6366f1',
        icon: cat?.icon ?? 'tag',
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
        transactionCount: row._count._all,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export async function getDailyTrend(userId: string, params: AnalyticsQueryParams) {
  const { start, end } = getDateRange({ ...params, months: 1 });

  const rows = await prisma.$queryRaw<
    Array<{ day: string; type: string; total: Prisma.Decimal }>
  >`
    SELECT
      TO_CHAR(date, 'YYYY-MM-DD') AS day,
      type,
      SUM(amount) AS total
    FROM "Transaction"
    WHERE "userId" = ${userId}
      AND date >= ${start}
      AND date <= ${end}
    GROUP BY day, type
    ORDER BY day ASC
  `;

  const dayMap = new Map<string, { date: string; income: number; expenses: number }>();
  for (const row of rows) {
    if (!dayMap.has(row.day)) {
      dayMap.set(row.day, { date: row.day, income: 0, expenses: 0 });
    }
    const entry = dayMap.get(row.day)!;
    if (row.type === 'INCOME') entry.income = Number(row.total);
    else entry.expenses = Number(row.total);
  }

  return Array.from(dayMap.values()).map((d) => ({
    ...d,
    net: d.income - d.expenses,
  }));
}
