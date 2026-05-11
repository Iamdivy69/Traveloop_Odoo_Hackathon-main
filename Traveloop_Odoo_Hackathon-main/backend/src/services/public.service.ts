import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Fetch a public trip by share_token (no auth required).
 */
export async function getPublicTrip(shareToken: string) {
  const trip = await prisma.trip.findUnique({
    where: { share_token: shareToken },
    include: {
      user: { select: { id: true, name: true, photo_url: true } },
      stops: {
        include: {
          city: true,
          activities: { include: { activity: true } },
        },
        orderBy: { order_index: 'asc' },
      },
      packing_items: true,
      notes: { orderBy: { created_at: 'desc' } },
    },
  });

  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
  if (!trip.is_public) throw new AppError(404, 'NOT_FOUND', 'This trip is not publicly shared');

  return trip;
}

/**
 * Deep-copy a public trip into the authenticated user's account.
 * Copies: trip → stops → stop_activities, packing_items
 */
export async function copyPublicTrip(shareToken: string, userId: string) {
  const source = await prisma.trip.findUnique({
    where: { share_token: shareToken },
    include: {
      stops: {
        include: {
          activities: true,
        },
        orderBy: { order_index: 'asc' },
      },
      packing_items: true,
    },
  });

  if (!source) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
  if (!source.is_public) throw new AppError(404, 'NOT_FOUND', 'This trip is not publicly shared');

  // Create the new trip
  const newTrip = await prisma.trip.create({
    data: {
      user_id: userId,
      name: `${source.name} (copy)`,
      description: source.description,
      start_date: source.start_date,
      end_date: source.end_date,
      cover_photo_url: source.cover_photo_url,
      total_budget: source.total_budget,
      is_public: false,
    },
  });

  // Copy stops
  for (const stop of source.stops) {
    const newStop = await prisma.tripStop.create({
      data: {
        trip_id: newTrip.id,
        city_id: stop.city_id,
        arrival_date: stop.arrival_date,
        departure_date: stop.departure_date,
        order_index: stop.order_index,
      },
    });

    // Copy stop activities
    for (const sa of stop.activities) {
      await prisma.stopActivity.create({
        data: {
          stop_id: newStop.id,
          activity_id: sa.activity_id,
          scheduled_time: sa.scheduled_time,
          custom_cost: sa.custom_cost,
          notes: sa.notes,
        },
      });
    }
  }

  // Copy packing items
  for (const item of source.packing_items) {
    await prisma.packingItem.create({
      data: {
        trip_id: newTrip.id,
        name: item.name,
        category: item.category,
        is_packed: false, // Reset packed status
      },
    });
  }

  return newTrip;
}
