import type { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateTripInput, TripListQuery, UpdateTripInput } from '../schemas/trip.schema';

/** Start of current calendar day (UTC) — matches user stats trip bucketing. */
function startOfUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

function publicTripShareUrl(shareToken: string): string {
  const origin =
    process.env.API_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`;
  const base = origin.replace(/\/$/, '');
  return `${base}/api/v1/public/${shareToken}`;
}

/**
 * Ensures the trip exists and belongs to the user.
 * Returns 404 for missing or non-owned trips (no existence leak).
 */
export async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, user_id: userId },
  });
  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
  return trip;
}

export async function listTrips(userId: string, query: TripListQuery) {
  const where: Prisma.TripWhereInput = { user_id: userId };
  const sod = startOfUtcToday();
  const now = new Date();

  if (query.status === 'upcoming') {
    where.start_date = { gt: sod };
  } else if (query.status === 'completed') {
    where.end_date = { lt: sod };
  } else if (query.status === 'ongoing') {
    where.AND = [{ start_date: { lte: now } }, { end_date: { gte: now } }];
  }

  const trips = await prisma.trip.findMany({
    where,
    skip: query.offset,
    take: query.limit,
    orderBy: { start_date: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      start_date: true,
      end_date: true,
      cover_photo_url: true,
      is_public: true,
      total_budget: true,
      _count: { select: { stops: true } },
    },
  });

  return trips;
}

export async function createTrip(userId: string, data: CreateTripInput) {
  const trip = await prisma.trip.create({
    data: {
      user_id: userId,
      name: data.name,
      description: data.description,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      cover_photo_url: data.cover_photo_url,
      total_budget: data.total_budget,
      is_public: data.is_public ?? false,
    },
  });

  return trip;
}

export async function getTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, user_id: userId },
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

  return trip;
}

export async function updateTrip(tripId: string, userId: string, data: UpdateTripInput) {
  const existing = await verifyTripOwnership(tripId, userId);

  const start =
    data.start_date !== undefined ? new Date(data.start_date) : existing.start_date;
  const end = data.end_date !== undefined ? new Date(data.end_date) : existing.end_date;
  if (end <= start) {
    throw new AppError(400, 'VALIDATION_ERROR', 'end_date must be after start_date');
  }

  const updateData: Prisma.TripUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.start_date !== undefined) updateData.start_date = new Date(data.start_date);
  if (data.end_date !== undefined) updateData.end_date = new Date(data.end_date);
  if (data.cover_photo_url !== undefined) updateData.cover_photo_url = data.cover_photo_url;
  if (data.total_budget !== undefined) updateData.total_budget = data.total_budget;
  if (data.is_public !== undefined) updateData.is_public = data.is_public;

  if (Object.keys(updateData).length === 0) {
    return getTrip(tripId, userId);
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: updateData,
  });

  return getTrip(tripId, userId);
}

export async function deleteTrip(tripId: string, userId: string): Promise<void> {
  await verifyTripOwnership(tripId, userId);
  await prisma.trip.delete({ where: { id: tripId } });
}

export async function toggleShare(tripId: string, userId: string) {
  const trip = await verifyTripOwnership(tripId, userId);

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: { is_public: !trip.is_public },
  });

  const share_url = updated.is_public ? publicTripShareUrl(updated.share_token) : null;

  return {
    is_public: updated.is_public,
    share_url,
    share_token: updated.share_token,
  };
}

/**
 * Budget calculation per TRD Section 6.
 */
export async function calculateBudget(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, user_id: userId },
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

  let activitiesCost = 0;
  let accommodationEstimate = 0;
  let mealsEstimate = 0;

  const stopDetails = trip.stops.map((stop) => {
    const arrivalDate = new Date(stop.arrival_date);
    const departureDate = new Date(stop.departure_date);
    const nights = Math.max(
      1,
      Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const costIndex = Number(stop.city.cost_index);

    let stopActivitiesCost = 0;
    for (const sa of stop.activities) {
      const cost = sa.custom_cost !== null ? Number(sa.custom_cost) : Number(sa.activity.cost);
      stopActivitiesCost += cost;
    }
    activitiesCost += stopActivitiesCost;

    const accom = costIndex * 0.45 * nights;
    accommodationEstimate += accom;

    const meals = costIndex * 0.3 * nights;
    mealsEstimate += meals;

    return {
      city: stop.city.name,
      nights,
      cost: Math.round((stopActivitiesCost + accom + meals) * 100) / 100,
    };
  });

  const transportEstimate = Math.max(0, trip.stops.length - 1) * 80;

  const totalEstimated =
    Math.round((activitiesCost + accommodationEstimate + mealsEstimate + transportEstimate) * 100) /
    100;
  const totalBudget = trip.total_budget ? Number(trip.total_budget) : null;
  const remaining =
    totalBudget !== null ? Math.round((totalBudget - totalEstimated) * 100) / 100 : null;

  const tripStart = new Date(trip.start_date);
  const tripEnd = new Date(trip.end_date);
  const tripDays = Math.max(
    1,
    Math.ceil((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24))
  );
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
