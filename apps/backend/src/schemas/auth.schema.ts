import { z } from 'zod';

const optionalTrimmed = (max: number) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim().max(max).optional()
  );

export const registerSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .max(255)
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  phone: optionalTrimmed(20),
  city: optionalTrimmed(100),
  country: optionalTrimmed(100),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
