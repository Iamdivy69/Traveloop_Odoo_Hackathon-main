import { z } from 'zod';

const optionalTrimmed = (max: number) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim().max(max).optional()
  );

export const registerSchema = z
  .object({
    name: z.string().trim().max(100).optional(),
    first_name: z.string().trim().max(100).optional(),
    last_name: z.string().trim().max(100).optional(),
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
  })
  .superRefine((data, ctx) => {
    if (!data.first_name && !data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['first_name'],
        message: 'First name or name is required',
      });
    }
  })
  .transform((data) => {
    let { name, first_name, last_name, ...rest } = data;
    if (name && (!first_name || !last_name)) {
      const parts = name.trim().split(/\s+/);
      first_name = first_name || parts[0] || '';
      last_name = last_name || parts.slice(1).join(' ') || '';
    }
    return {
      first_name: first_name || '',
      last_name: last_name || '',
      ...rest,
    };
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
