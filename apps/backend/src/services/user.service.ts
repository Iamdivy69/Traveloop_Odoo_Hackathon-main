import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import type { UpdateProfileInput } from '../schemas/user.schema';

const rawSalt = process.env.BCRYPT_SALT_ROUNDS ?? '12';
const parsedSalt = parseInt(rawSalt, 10);
const SALT_ROUNDS = Number.isFinite(parsedSalt) && parsedSalt > 0 ? parsedSalt : 12;

function stripPassword<T extends { password_hash: string }>(user: T): Omit<T, 'password_hash'> {
  const { password_hash: _pw, ...rest } = user;
  return rest;
}

/** Start of current calendar day (UTC), for trip date comparisons. */
function startOfUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return stripPassword(user);
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const updateData: Prisma.UserUpdateInput = {};

  if (data.first_name !== undefined) updateData.first_name = data.first_name;
  if (data.last_name !== undefined) updateData.last_name = data.last_name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.photo_url !== undefined) updateData.photo_url = data.photo_url;
  if (data.saved_destinations !== undefined) updateData.saved_destinations = data.saved_destinations;

  if (Object.keys(updateData).length === 0) {
    return getProfile(userId);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  return stripPassword(user);
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

export async function deleteAccount(userId: string): Promise<void> {
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) throw new AppError(404, 'NOT_FOUND', 'User not found');
  await prisma.user.delete({ where: { id: userId } });
}

export type UserStats = {
  total_trips: number;
  upcoming_trips: number;
  completed_trips: number;
  total_cities_visited: number;
  total_budget_used: number;
};

export async function getStats(userId: string): Promise<UserStats> {
  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!userExists) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const sod = startOfUtcToday();

  const [total_trips, upcoming_trips, completed_trips, budgetAgg, cityRows] = await Promise.all([
    prisma.trip.count({ where: { user_id: userId } }),
    prisma.trip.count({
      where: { user_id: userId, start_date: { gt: sod } },
    }),
    prisma.trip.count({
      where: { user_id: userId, end_date: { lt: sod } },
    }),
    prisma.trip.aggregate({
      where: { user_id: userId, total_budget: { not: null } },
      _sum: { total_budget: true },
    }),
    prisma.tripStop.findMany({
      where: { trip: { user_id: userId } },
      select: { city_id: true },
      distinct: ['city_id'],
    }),
  ]);

  const sum = budgetAgg._sum.total_budget;
  const total_budget_used = sum == null ? 0 : Number(sum);

  return {
    total_trips,
    upcoming_trips,
    completed_trips,
    total_cities_visited: cityRows.length,
    total_budget_used,
  };
}
