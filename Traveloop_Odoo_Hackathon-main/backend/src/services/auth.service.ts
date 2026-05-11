import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

function signToken(user: { id: string; email: string; is_admin: boolean }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, is_admin: user.is_admin },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

function formatUser(user: any) {
  const { password_hash, ...rest } = user;
  return rest;
}

export async function register(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  password: string;
}) {
  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Email is already registered');
  }

  const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

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
  return { token, user: formatUser(user) };
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const token = signToken(user);
  return { token, user: formatUser(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return formatUser(user);
}
