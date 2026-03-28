import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import type { CreateBudgetInput, UpdateBudgetInput } from '../validators/budget.validator';

type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

function getPeriodDateRange(period: BudgetPeriod): { start: Date; end: Date } {
  const now = new Date();
  if (period === 'MONTHLY') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }
  if (period === 'WEEKLY') {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  return {
    start: new Date(now.getFullYear(), 0, 1),
    end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
  };
}

export async function getBudgets(userId: string) {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true, type: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const enriched = await Promise.all(
    budgets.map(async (budget) => {
      const { start, end } = getPeriodDateRange(budget.period);
      const result = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });
      const spent = Number(result._sum.amount ?? 0);
      const budgetAmount = Number(budget.amount);
      const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
      return {
        ...budget,
        amount: budgetAmount,
        spent,
        remaining: Math.max(budgetAmount - spent, 0),
        percentage: Math.round(percentage * 10) / 10,
        isOverBudget: spent > budgetAmount,
        periodStart: start,
        periodEnd: end,
      };
    })
  );

  return enriched;
}

export async function createBudget(userId: string, input: CreateBudgetInput) {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, userId },
  });
  if (!category) throw new AppError(404, 'Category not found');
  if (category.type !== 'EXPENSE') {
    throw new AppError(400, 'Budgets can only be set for expense categories');
  }

  return prisma.budget.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
      period: input.period,
      userId,
      categoryId: input.categoryId,
    },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true, type: true } },
    },
  });
}

export async function updateBudget(id: string, userId: string, input: UpdateBudgetInput) {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw new AppError(404, 'Budget not found');

  return prisma.budget.update({
    where: { id },
    data: { amount: new Prisma.Decimal(input.amount) },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true, type: true } },
    },
  });
}

export async function deleteBudget(id: string, userId: string) {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw new AppError(404, 'Budget not found');
  await prisma.budget.delete({ where: { id } });
}

export async function getBudgetSummary(userId: string) {
  const budgets = await getBudgets(userId);
  const total = budgets.length;
  const overBudget = budgets.filter((b) => b.isOverBudget).length;
  const nearLimit = budgets.filter((b) => !b.isOverBudget && b.percentage >= 80).length;
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  return { total, overBudget, nearLimit, totalBudgeted, totalSpent, budgets };
}
