import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFiltersInput } from '../validators/transaction.validator';

export async function getTransactions(userId: string, filters: TransactionFiltersInput) {
  const { type, categoryId, startDate, endDate, search, page, limit, sortBy, sortOrder } = filters;

  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(search && {
      description: { contains: search, mode: 'insensitive' },
    }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
          },
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true, icon: true, type: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTransactionById(id: string, userId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true, type: true } },
    },
  });
  if (!transaction) throw new AppError(404, 'Transaction not found');
  return transaction;
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, userId },
  });
  if (!category) throw new AppError(404, 'Category not found');
  if (category.type !== input.type) {
    throw new AppError(400, `Category type mismatch: category is ${category.type} but transaction type is ${input.type}`);
  }

  return prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      description: input.description,
      notes: input.notes,
      date: new Date(input.date),
      isRecurring: input.isRecurring ?? false,
      recurringInterval: input.isRecurring ? input.recurringInterval : null,
      userId,
      categoryId: input.categoryId,
    },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true, type: true } },
    },
  });
}

export async function updateTransaction(id: string, userId: string, input: UpdateTransactionInput) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!transaction) throw new AppError(404, 'Transaction not found');

  if (input.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: input.categoryId, userId } });
    if (!category) throw new AppError(404, 'Category not found');
    const effectiveType = input.type ?? transaction.type;
    if (category.type !== effectiveType) {
      throw new AppError(400, `Category type mismatch`);
    }
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      ...(input.amount !== undefined && { amount: new Prisma.Decimal(input.amount) }),
      ...(input.type && { type: input.type }),
      ...(input.description && { description: input.description }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.date && { date: new Date(input.date) }),
      ...(input.categoryId && { categoryId: input.categoryId }),
      ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
      ...(input.isRecurring === true && input.recurringInterval
        ? { recurringInterval: input.recurringInterval }
        : input.isRecurring === false
          ? { recurringInterval: null }
          : {}),
    },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true, type: true } },
    },
  });
}

export async function deleteTransaction(id: string, userId: string) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!transaction) throw new AppError(404, 'Transaction not found');
  await prisma.transaction.delete({ where: { id } });
}
