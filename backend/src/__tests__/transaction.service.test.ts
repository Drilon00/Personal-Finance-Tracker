process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
  },
}));

import prisma from '../lib/prisma';
import * as txService from '../services/transaction.service';

const mockPrisma = prisma as any;

const fakeCategory = {
  id: 'cat-1',
  name: 'Food',
  type: 'EXPENSE',
  color: '#ff0000',
  icon: 'utensils',
  isDefault: false,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeTransaction = {
  id: 'tx-1',
  amount: 50,
  type: 'EXPENSE',
  description: 'Lunch',
  notes: null,
  date: new Date('2024-01-15'),
  userId: 'user-1',
  categoryId: 'cat-1',
  category: fakeCategory,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Transaction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('returns a list of transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([fakeTransaction]);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const result = await txService.getTransactions('user-1', {
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('returns an empty list when the user has no transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const result = await txService.getTransactions('user-1', {
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      expect(result.transactions).toHaveLength(0);
    });
  });

  describe('createTransaction', () => {
    it('creates a transaction successfully', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(fakeCategory);
      mockPrisma.transaction.create.mockResolvedValue(fakeTransaction);

      const result = await txService.createTransaction('user-1', {
        amount: 50,
        type: 'EXPENSE',
        description: 'Lunch',
        date: '2024-01-15',
        categoryId: 'cat-1',
        isRecurring: false,
      });

      expect(result.description).toBe('Lunch');
    });

    it('throws 404 if the category does not belong to the user', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        txService.createTransaction('user-1', {
          amount: 50,
          type: 'EXPENSE',
          description: 'Lunch',
          date: '2024-01-15',
          categoryId: 'wrong-cat',
          isRecurring: false,
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('deleteTransaction', () => {
    it('deletes a transaction successfully', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(fakeTransaction);
      mockPrisma.transaction.delete.mockResolvedValue(fakeTransaction);

      await txService.deleteTransaction('tx-1', 'user-1');

      expect(mockPrisma.transaction.delete).toHaveBeenCalledTimes(1);
    });

    it('throws 404 if the transaction is not found', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(txService.deleteTransaction('tx-ghost', 'user-1')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
