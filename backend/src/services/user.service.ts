import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import type { UpdateProfileInput, ChangePasswordInput } from '../validators/user.validator';

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.currency && { currency: input.currency }),
    },
    select: { id: true, email: true, name: true, currency: true, createdAt: true },
  });
  return user;
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  const passwordMatch = await bcrypt.compare(input.currentPassword, user.password);
  if (!passwordMatch) throw new AppError(400, 'Current password is incorrect');

  if (input.currentPassword === input.newPassword) {
    throw new AppError(400, 'New password must be different from current password');
  }

  const hashed = await bcrypt.hash(input.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  // Invalidate all refresh tokens to force re-login everywhere
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function deleteAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new AppError(400, 'Incorrect password');

  await prisma.user.delete({ where: { id: userId } });
}
