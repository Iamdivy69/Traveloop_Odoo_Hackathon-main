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

function formatUserProfile(user: any) {
  const { password_hash: _pw, ...rest } = user;
  return {
    ...rest,
    name: `${user.first_name} ${user.last_name}`.trim(),
    isPublic: user.is_public,
    preferredCurrency: user.preferred_currency,
    photoUrl: user.photo_url,
    avatarUrl: user.photo_url,
  };
}

/** Start of current calendar day (UTC), for trip date comparisons. */
function startOfUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deleted_at !== null) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return formatUserProfile(user);
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, deleted_at: true } });
  if (!exists || exists.deleted_at !== null) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const updateData: Prisma.UserUpdateInput = {};

  if (data.first_name !== undefined) updateData.first_name = data.first_name;
  if (data.last_name !== undefined) updateData.last_name = data.last_name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.photo_url !== undefined) updateData.photo_url = data.photo_url;
  if (data.saved_destinations !== undefined) updateData.saved_destinations = data.saved_destinations;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.is_public !== undefined) updateData.is_public = data.is_public;
  if (data.preferred_currency !== undefined) updateData.preferred_currency = data.preferred_currency;

  if (Object.keys(updateData).length === 0) {
    return getProfile(userId);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  return formatUserProfile(user);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deleted_at !== null) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Current password is incorrect');
  }

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash, token_version: { increment: 1 } },
  });

  return { message: 'Password updated successfully' };
}

export async function deleteAccount(userId: string): Promise<void> {
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, deleted_at: true, email: true } });
  if (!exists || exists.deleted_at !== null) throw new AppError(404, 'NOT_FOUND', 'User not found');

  // FIX (Soft-Delete Data Leak / GDPR): Wrap the user tombstone and all
  // downstream privacy actions in a single transaction so either ALL complete
  // or NONE commit.  Specifically:
  //   1. Null the username so it becomes immediately re-claimable.
  //   2. Tombstone the email so the unique constraint is freed.
  //   3. Set deleted_at to mark the account as soft-deleted.
  //   4. Unpublish every public trip so they are no longer visible via
  //      share tokens or public profile listings (GDPR right-to-erasure).
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        deleted_at: new Date(),
        username: null,
        email: `${exists.email}-deleted-${Date.now()}`,
      },
    }),
    prisma.trip.updateMany({
      where: { user_id: userId, is_public: true },
      data: { is_public: false },
    }),
  ]);
}


export type UserStats = {
  total_trips: number;
  upcoming_trips: number;
  completed_trips: number;
  total_cities_visited: number;
  total_budget_used: number;
};

export async function getStats(userId: string): Promise<UserStats> {
  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, deleted_at: true } });
  if (!userExists || userExists.deleted_at !== null) throw new AppError(404, 'NOT_FOUND', 'User not found');

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

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  const cleanUsername = username.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      username: cleanUsername,
      deleted_at: null,
    },
    select: { id: true },
  });
  return { available: !user };
}

export async function updateUsername(userId: string, username: string) {
  const cleanUsername = username.trim().toLowerCase();

  // Check if username is already taken by another user
  const taken = await prisma.user.findFirst({
    where: {
      username: cleanUsername,
      deleted_at: null,
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (taken) {
    throw new AppError(409, 'CONFLICT', 'Username is already taken');
  }

  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, deleted_at: true } });
  if (!exists || exists.deleted_at !== null) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { username: cleanUsername },
  });

  return formatUserProfile(user);
}

export async function getPublicProfile(username: string) {
  const cleanUsername = username.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      username: cleanUsername,
      deleted_at: null,
    },
    include: {
      trips: {
        where: { is_public: true },
        select: {
          id: true,
          name: true,
          description: true,
          start_date: true,
          end_date: true,
          cover_photo_url: true,
          created_at: true,
        },
      },
    },
  });

  if (!user || !user.is_public) {
    throw new AppError(404, 'NOT_FOUND', 'Profile not found or is private');
  }

  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    bio: user.bio,
    photo_url: user.photo_url,
    photoUrl: user.photo_url,
    avatarUrl: user.photo_url,
    city: user.city,
    country: user.country,
    trips: user.trips,
  };
}
