import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

/** Verify trip ownership — reused across stop, activity, packing, note services */
export async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
  if (trip.user_id !== userId) throw new AppError(403, 'FORBIDDEN', 'You do not own this trip');
  return trip;
}

export async function listTrips(userId: string, upcoming?: boolean) {
  const where: any = { user_id: userId };
  if (upcoming) {
    where.start_date = { gte: new Date() };
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { start_date: 'asc' },
    include: {
      stops: {
        include: { city: true },
        orderBy: { order_index: 'asc' },
      },
    },
  });

  return trips;
}

export async function createTrip(userId: string, data: {
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  cover_photo_url?: string;
  total_budget?: number;
}) {
  const trip = await prisma.trip.create({
    data: {
      user_id: userId,
      name: data.name,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      description: data.description,
      cover_photo_url: data.cover_photo_url,
      total_budget: data.total_budget,
    },
  });

  return trip;
}

export async function getTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true },
          },
        },
        orderBy: { order_index: 'asc' },
      },
      packing_items: true,
      notes: { orderBy: { created_at: 'desc' } },
    },
  });

  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
  if (trip.user_id !== userId) throw new AppError(403, 'FORBIDDEN', 'You do not own this trip');

  return trip;
}

export async function updateTrip(tripId: string, userId: string, data: any) {
  await verifyTripOwnership(tripId, userId);

  const updateData: any = { ...data };
  if (data.start_date) updateData.start_date = new Date(data.start_date);
  if (data.end_date) updateData.end_date = new Date(data.end_date);

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: updateData,
  });

  return trip;
}

export async function deleteTrip(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);
  await prisma.trip.delete({ where: { id: tripId } });
  return { message: 'Trip deleted successfully' };
}

export async function toggleShare(tripId: string, userId: string, isPublic: boolean) {
  await verifyTripOwnership(tripId, userId);

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: { is_public: isPublic },
  });

  return {
    is_public: trip.is_public,
    share_url: trip.is_public ? `/api/v1/public/${trip.share_token}` : null,
    share_token: trip.share_token,
  };
}

/**
 * Budget calculation per TRD Section 6.
 * All data derived from existing tables — no separate budget table.
 */
export async function calculateBudget(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true },
          },
        },
        orderBy: { order_index: 'asc' },
      },
    },
  });

  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
  if (trip.user_id !== userId) throw new AppError(403, 'FORBIDDEN', 'You do not own this trip');

  let activitiesCost = 0;
  let accommodationEstimate = 0;
  let mealsEstimate = 0;

  const stopDetails = trip.stops.map((stop) => {
    const arrivalDate = new Date(stop.arrival_date);
    const departureDate = new Date(stop.departure_date);
    const nights = Math.max(1, Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24)));
    const costIndex = Number(stop.city.cost_index);

    // Activities cost for this stop
    let stopActivitiesCost = 0;
    for (const sa of stop.activities) {
      const cost = sa.custom_cost !== null ? Number(sa.custom_cost) : Number(sa.activity.cost);
      stopActivitiesCost += cost;
    }
    activitiesCost += stopActivitiesCost;

    // Accommodation: 45% of cost_index * nights
    const accom = costIndex * 0.45 * nights;
    accommodationEstimate += accom;

    // Meals: 30% of cost_index * nights
    const meals = costIndex * 0.30 * nights;
    mealsEstimate += meals;

    return {
      city: stop.city.name,
      nights,
      cost: Math.round((stopActivitiesCost + accom + meals) * 100) / 100,
    };
  });

  // Transport: flat $80 per city transition
  const transportEstimate = Math.max(0, trip.stops.length - 1) * 80;

  const totalEstimated = Math.round((activitiesCost + accommodationEstimate + mealsEstimate + transportEstimate) * 100) / 100;
  const totalBudget = trip.total_budget ? Number(trip.total_budget) : null;
  const remaining = totalBudget !== null ? Math.round((totalBudget - totalEstimated) * 100) / 100 : null;

  // Calculate trip duration for daily average
  const tripStart = new Date(trip.start_date);
  const tripEnd = new Date(trip.end_date);
  const tripDays = Math.max(1, Math.ceil((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyAvg = Math.round((totalEstimated / tripDays) * 100) / 100;

  return {
    breakdown: {
      activities: Math.round(activitiesCost * 100) / 100,
      accommodation: Math.round(accommodationEstimate * 100) / 100,
      meals: Math.round(mealsEstimate * 100) / 100,
      transport: transportEstimate,
    },
    total_estimated: totalEstimated,
    total_budget: totalBudget,
    remaining,
    daily_avg: dailyAvg,
    over_budget: remaining !== null ? remaining < 0 : false,
    stops: stopDetails,
  };
}
