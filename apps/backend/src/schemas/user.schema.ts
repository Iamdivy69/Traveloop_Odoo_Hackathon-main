import { z } from 'zod';

const optionalTrimmed = (max: number) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim().max(max).optional()
  );

const nullableTrimmed = (max: number) =>
  z.preprocess((val) => (val === '' ? null : val), z.string().trim().max(max).nullable().optional());

export const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const reservedUsernames = ['admin', 'support', 'traveloop', 'api', 'root', 'system'];

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(usernameRegex, 'Username can only contain alphanumeric characters and underscores, and cannot start with a number')
  .refine(
    (val) => !reservedUsernames.includes(val.toLowerCase()),
    { message: 'This username is reserved' }
  );

/** PATCH /users/me — all fields optional; omit to leave unchanged, null clears where applicable. */
export const updateProfileSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().min(1).max(100).optional(),
    name: z.string().trim().min(1).max(100).optional(),
    phone: nullableTrimmed(20),
    city: nullableTrimmed(100),
    country: nullableTrimmed(100),
    language: optionalTrimmed(10),
    photo_url: z
      .preprocess(
        (val) => (val === '' ? null : val),
        z.union([z.string().url(), z.null()]).optional()
      ),
    saved_destinations: z.array(z.string().min(1).max(200)).max(100).optional(),
    bio: nullableTrimmed(200),
    is_public: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    preferred_currency: optionalTrimmed(10),
    preferredCurrency: optionalTrimmed(10),
  })
  .strict()
  .transform((data) => {
    let {
      name,
      isPublic,
      preferredCurrency,
      first_name,
      last_name,
      is_public,
      preferred_currency,
      ...rest
    } = data;

    if (name !== undefined) {
      const parts = name.trim().split(/\s+/);
      if (first_name === undefined) {
        first_name = parts[0] || '';
      }
      if (last_name === undefined) {
        last_name = parts.slice(1).join(' ') || '';
      }
    }

    return {
      first_name,
      last_name,
      is_public: is_public !== undefined ? is_public : isPublic,
      preferred_currency: preferred_currency !== undefined ? preferred_currency : preferredCurrency,
      ...rest,
    };
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateUsernameSchema = z.object({
  username: usernameSchema,
});

export const checkUsernameQuerySchema = z.object({
  username: usernameSchema,
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters').max(72),
});

