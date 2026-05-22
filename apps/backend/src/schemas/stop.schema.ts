import { z } from 'zod';

const isoDate = (field: string) =>
  z.string().refine((d) => !isNaN(Date.parse(d)), `Invalid date format for ${field}`);

export const createStopSchema = z.object({
  city_id: z.string().uuid('Invalid city ID').optional(),
  custom_city_name: z.string().trim().max(100).optional(),
  arrival_date: isoDate('arrival_date'),
  departure_date: isoDate('departure_date'),
  notes: z.string().trim().optional(),
}).refine(
  (data) => !!data.city_id || !!data.custom_city_name,
  { message: 'Either city_id or custom_city_name must be provided', path: ['city_id'] }
).refine(
  (data) => new Date(data.departure_date) > new Date(data.arrival_date),
  { message: 'departure_date must be after arrival_date', path: ['departure_date'] }
);

export const updateStopSchema = z.object({
  arrival_date: isoDate('arrival_date').optional(),
  departure_date: isoDate('departure_date').optional(),
  notes: z.string().trim().nullable().optional(),
});

export const reorderStopsSchema = z.object({
  order: z.array(z.string().uuid()),
});
