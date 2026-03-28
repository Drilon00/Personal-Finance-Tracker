import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export async function getCategories(userId: string) {
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      _count: { select: { transactions: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  return categories.map((cat) => ({
    ...cat,
    transactionCount: cat._count.transactions,
    _count: undefined,
  }));
}

export async function getCategoryById(id: string, userId: string) {
  const category = await prisma.category.findFirst({
    where: { id, userId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!category) throw new AppError(404, 'Category not found');
  return { ...category, transactionCount: category._count.transactions, _count: undefined };
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  return prisma.category.create({
    data: { ...input, userId },
    include: { _count: { select: { transactions: true } } },
  });
}

export async function updateCategory(id: string, userId: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw new AppError(404, 'Category not found');

  return prisma.category.update({
    where: { id },
    data: input,
    include: { _count: { select: { transactions: true } } },
  });
}

export async function deleteCategory(id: string, userId: string) {
  const category = await prisma.category.findFirst({
    where: { id, userId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!category) throw new AppError(404, 'Category not found');
  if (category._count.transactions > 0) {
    throw new AppError(
      409,
      `Cannot delete category with ${category._count.transactions} transaction(s). Reassign them first.`
    );
  }

  await prisma.category.delete({ where: { id } });
}
