import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

const rawSalt = process.env.BCRYPT_SALT_ROUNDS ?? '12';
const parsedSalt = parseInt(rawSalt, 10);
const SALT_ROUNDS = Number.isFinite(parsedSalt) && parsedSalt > 0 ? parsedSalt : 12;

export type AuthUserResponse = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'CONFIG_ERROR', 'JWT_SECRET is not configured');
  }
  return secret;
}

function toAuthUserResponse(user: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_admin: user.is_admin,
  };
}

function signToken(user: { id: string; email: string; is_admin: boolean }): string {
  const secret = getJwtSecret();
  return jwt.sign(
    { sub: user.id, email: user.email, is_admin: user.is_admin },
    secret,
    { expiresIn: '7d' }
  );
}

function stripPassword<T extends { password_hash: string }>(user: T): Omit<T, 'password_hash'> {
  const { password_hash: _pw, ...rest } = user;
  return rest;
}

export async function register(
  data: RegisterInput
): Promise<{ token: string; user: AuthUserResponse }> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Email is already registered');
  }

  const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        country: data.country,
        password_hash,
      },
    });

    const token = signToken(user);
    return { token, user: toAuthUserResponse(user) };
  } catch (err: any) {
    if (err?.name === 'PrismaClientKnownRequestError' && err?.code === 'P2002') {
      throw new AppError(409, 'CONFLICT', 'Email is already registered');
    }
    throw err;
  }
}

export async function login(
  data: LoginInput
): Promise<{ token: string; user: AuthUserResponse }> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const token = signToken(user);
  return { token, user: toAuthUserResponse(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return stripPassword(user);
}
