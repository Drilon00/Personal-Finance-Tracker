import { Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import type { AuthenticatedRequest } from '../types';

export async function list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await transactionService.getTransactions(req.user.id, req.query as any);
    res.json({ success: true, data: result.transactions, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id, req.user.id);
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await transactionService.createTransaction(req.user.id, req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user.id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    next(err);
  }
}
