import { Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import type { AuthenticatedRequest } from '../types';

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await userService.changePassword(req.user.id, req.body);
    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) { next(err); }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await userService.deleteAccount(req.user.id, req.body.password);
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) { next(err); }
}
