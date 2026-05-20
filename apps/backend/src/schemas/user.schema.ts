import { z } from 'zod';

const optionalTrimmed = (max: number) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim().max(max).optional()
  );

const nullableTrimmed = (max: number) =>
  z.preprocess((val) => (val === '' ? null : val), z.string().trim().max(max).nullable().optional());

/** PATCH /users/me — all fields optional; omit to leave unchanged, null clears where applicable. */
export const updateProfileSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().min(1).max(100).optional(),
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
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters').max(72),
});
