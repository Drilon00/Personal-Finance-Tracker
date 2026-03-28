import { Response, NextFunction, Request } from 'express';
import * as authService from '../services/auth.service';
import { config } from '../config';
import type { AuthenticatedRequest } from '../types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.cookie(config.jwt.refreshCookieName, refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie(config.jwt.refreshCookieName, refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[config.jwt.refreshCookieName];
    if (!token) {
      res.status(401).json({ success: false, error: 'No refresh token provided' });
      return;
    }
    const { accessToken, refreshToken } = await authService.refreshAccessToken(token);
    res.cookie(config.jwt.refreshCookieName, refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[config.jwt.refreshCookieName];
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie(config.jwt.refreshCookieName, { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}
