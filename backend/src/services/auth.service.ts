import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
} from '../lib/jwt';
import { AppError } from '../middleware/error.middleware';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

const SALT_ROUNDS = 12;

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password: hashedPassword },
    select: { id: true, email: true, name: true, currency: true, createdAt: true },
  });

  await createDefaultCategories(user.id);

  const tokenPayload = { sub: user.id, email: user.email, name: user.name };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiryDate() },
  });

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);
  if (!passwordMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const tokenPayload = { sub: user.id, email: user.email, name: user.name };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiryDate() },
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    throw new AppError(401, 'Refresh token is invalid or expired');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError(401, 'User not found');
  }

  const newRefreshToken = signRefreshToken({ sub: user.id, email: user.email, name: user.name });
  const newAccessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name });

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { token: newRefreshToken, expiresAt: getRefreshTokenExpiryDate() },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, currency: true, createdAt: true },
  });
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

async function createDefaultCategories(userId: string) {
  const defaults = [
    { name: 'Salary', type: 'INCOME' as const, color: '#10b981', icon: 'briefcase', isDefault: true },
    { name: 'Freelance', type: 'INCOME' as const, color: '#3b82f6', icon: 'laptop', isDefault: true },
    { name: 'Investment', type: 'INCOME' as const, color: '#8b5cf6', icon: 'trending-up', isDefault: true },
    { name: 'Other Income', type: 'INCOME' as const, color: '#6b7280', icon: 'plus-circle', isDefault: true },
    { name: 'Housing', type: 'EXPENSE' as const, color: '#ef4444', icon: 'home', isDefault: true },
    { name: 'Food & Dining', type: 'EXPENSE' as const, color: '#f97316', icon: 'utensils', isDefault: true },
    { name: 'Transportation', type: 'EXPENSE' as const, color: '#eab308', icon: 'car', isDefault: true },
    { name: 'Healthcare', type: 'EXPENSE' as const, color: '#ec4899', icon: 'heart-pulse', isDefault: true },
    { name: 'Shopping', type: 'EXPENSE' as const, color: '#8b5cf6', icon: 'shopping-bag', isDefault: true },
    { name: 'Entertainment', type: 'EXPENSE' as const, color: '#06b6d4', icon: 'tv', isDefault: true },
    { name: 'Utilities', type: 'EXPENSE' as const, color: '#14b8a6', icon: 'zap', isDefault: true },
    { name: 'Other Expense', type: 'EXPENSE' as const, color: '#6b7280', icon: 'more-horizontal', isDefault: true },
  ];

  await prisma.category.createMany({
    data: defaults.map((cat) => ({ ...cat, userId })),
    skipDuplicates: true,
  });
}
