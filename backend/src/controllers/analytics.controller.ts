import { Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';
import type { AuthenticatedRequest } from '../types';

export async function overview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getOverview(req.user.id, req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function monthly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const months = Math.min(parseInt(req.query.months as string) || 12, 24);
    const data = await analyticsService.getMonthlyBreakdown(req.user.id, months);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function categoryBreakdown(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const type = (req.query.type as 'INCOME' | 'EXPENSE') || 'EXPENSE';
    const data = await analyticsService.getCategoryBreakdown(req.user.id, type, req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function dailyTrend(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getDailyTrend(req.user.id, req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
