import { Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import type { AuthenticatedRequest } from '../types';

export async function list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getCategories(req.user.id);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getCategoryById(req.params.id, req.user.id);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.createCategory(req.user.id, req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteCategory(req.params.id, req.user.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
}
