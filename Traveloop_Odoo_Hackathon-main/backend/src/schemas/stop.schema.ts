import { z } from 'zod';

export const createStopSchema = z.object({
  city_id: z.string().uuid('Invalid city ID'),
  arrival_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format'),
  departure_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format'),
}).refine((data) => new Date(data.departure_date) > new Date(data.arrival_date), {
  message: 'departure_date must be after arrival_date',
  path: ['departure_date'],
});

export const updateStopSchema = z.object({
  arrival_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format').optional(),
  departure_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format').optional(),
});

export const reorderStopsSchema = z.object({
  order: z.array(z.string().uuid()),
});
