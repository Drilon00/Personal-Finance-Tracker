import { Response, NextFunction } from 'express';
import * as budgetService from '../services/budget.service';
import type { AuthenticatedRequest } from '../types';

export async function list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const budgets = await budgetService.getBudgets(req.user.id);
    res.json({ success: true, data: budgets });
  } catch (err) { next(err); }
}

export async function summary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await budgetService.getBudgetSummary(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const budget = await budgetService.createBudget(req.user.id, req.body);
    res.status(201).json({ success: true, data: budget });
  } catch (err) { next(err); }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const budget = await budgetService.updateBudget(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await budgetService.deleteBudget(req.params.id, req.user.id);
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) { next(err); }
}
