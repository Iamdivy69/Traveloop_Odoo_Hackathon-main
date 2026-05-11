import { z } from 'zod';

export const registerSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email format').max(255).transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be at most 72 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format').transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

