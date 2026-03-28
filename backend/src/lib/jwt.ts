import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { JwtPayload } from '../types';

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'finance-tracker',
    audience: 'finance-tracker-client',
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'finance-tracker',
    audience: 'finance-tracker-client',
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'finance-tracker',
    audience: 'finance-tracker-client',
  }) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'finance-tracker',
    audience: 'finance-tracker-client',
  }) as JwtPayload;
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}
