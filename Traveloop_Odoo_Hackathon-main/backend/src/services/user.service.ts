import bcrypt from 'bcryptjs';
import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

function formatUser(user: any) {
  const { password_hash, ...rest } = user;
  return rest;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return formatUser(user);
}

export async function updateProfile(userId: string, data: {
  name?: string;
  photo_url?: string | null;
  language?: string;
  saved_destinations?: string[];
}) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return formatUser(user);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Current password is incorrect');
  }

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash },
  });

  return { message: 'Password updated successfully' };
}

export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  return { message: 'Account deleted successfully' };
}
