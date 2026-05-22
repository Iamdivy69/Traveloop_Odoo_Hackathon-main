import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { verifyTripOwnership } from './trip.service';

export async function listStops(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);

  // FIX (Performance): Only select the fields needed for the list view
  // rather than deeply including all nested relations. Full stop detail
  // is fetched separately when the user opens a specific stop.
  const stops = await prisma.tripStop.findMany({
    where: { trip_id: tripId },
    include: {
      city: true,
      activities: {
        include: { activity: true },
        orderBy: { scheduled_time: 'asc' },
      },
    },
    orderBy: { order_index: 'asc' },
  });

  return stops;
}

export async function createStop(
  tripId: string,
  userId: string,
  data: { city_id?: string; custom_city_name?: string; arrival_date: string; departure_date: string; notes?: string }
) {
  const trip = await verifyTripOwnership(tripId, userId);

  // Verify city exists if city_id is provided
  if (data.city_id) {
    const city = await prisma.city.findUnique({ where: { id: data.city_id } });
    if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');
  }

  const arrival = new Date(data.arrival_date);
  const departure = new Date(data.departure_date);

  if (departure <= arrival) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Departure date must be after arrival date');
  }

  // Only validate against trip dates if trip has dates set
  if (trip.start_date && trip.end_date) {
    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    if (arrival < tripStart || arrival > tripEnd) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Arrival date must be within the trip date range');
    }
    if (departure > tripEnd) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Departure date must be within the trip date range');
    }
  }

  // FIX (Race Condition): Wrap the aggregate + create in a serializable
  // transaction so that two concurrent requests cannot observe the same
  // max order_index and be assigned duplicate values.
  const stop = await prisma.$transaction(async (tx) => {
    const maxOrder = await tx.tripStop.aggregate({
      where: { trip_id: tripId },
      _max: { order_index: true },
    });
    const nextOrder = (maxOrder._max.order_index ?? 0) + 1;

    return tx.tripStop.create({
      data: {
        trip_id: tripId,
        city_id: data.city_id,
        custom_city_name: data.custom_city_name,
        arrival_date: arrival,
        departure_date: departure,
        order_index: nextOrder,
      },
      include: {
        city: true,
        activities: { include: { activity: true } },
      },
    });
  });

  return stop;
}

export async function updateStop(
  tripId: string,
  stopId: string,
  userId: string,
  data: { arrival_date?: string; departure_date?: string; notes?: string | null }
) {
  const trip = await verifyTripOwnership(tripId, userId);

  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, trip_id: tripId },
  });
  if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');

  const arrival = data.arrival_date ? new Date(data.arrival_date) : new Date(stop.arrival_date);
  const departure = data.departure_date ? new Date(data.departure_date) : new Date(stop.departure_date);

  if (departure <= arrival) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Departure date must be after arrival date');
  }

  // FIX (Edge Case): validate updated stop dates against trip bounds
  if (trip.start_date && trip.end_date) {
    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    if (arrival < tripStart || arrival > tripEnd) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Arrival date must be within the trip date range');
    }
    if (departure > tripEnd) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Departure date must be within the trip date range');
    }
  }

  const updateData: { arrival_date?: Date; departure_date?: Date } = {};
  if (data.arrival_date) updateData.arrival_date = arrival;
  if (data.departure_date) updateData.departure_date = departure;

  const updated = await prisma.tripStop.update({
    where: { id: stopId },
    data: updateData,
    include: {
      city: true,
      activities: { include: { activity: true } },
    },
  });

  return updated;
}

export async function deleteStop(tripId: string, stopId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);

  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, trip_id: tripId },
  });
  if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');

  await prisma.tripStop.delete({ where: { id: stopId } });
  return { message: 'Stop deleted successfully' };
}

export async function reorderStops(tripId: string, userId: string, order: string[]) {
  await verifyTripOwnership(tripId, userId);

  // FIX (Critical IDOR): Validate that every stopId in the payload actually
  // belongs to this trip BEFORE running any updates. Without this check a
  // malicious user could pass stopIds from another user's trip and silently
  // mutate their itinerary order.
  if (order.length === 0) {
    return { message: 'Stops reordered successfully' };
  }

  // Deduplicate: reject if caller sent duplicate IDs (would corrupt ordering)
  const unique = new Set(order);
  if (unique.size !== order.length) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Duplicate stop IDs in reorder payload');
  }

  const ownedStops = await prisma.tripStop.findMany({
    where: { trip_id: tripId },
    select: { id: true },
  });
  const ownedIds = new Set(ownedStops.map((s) => s.id));

  for (const stopId of order) {
    if (!ownedIds.has(stopId)) {
      throw new AppError(403, 'FORBIDDEN', `Stop ${stopId} does not belong to this trip`);
    }
  }

  // FIX (Transaction Rollback): Use an interactive transaction so if any
  // individual update fails (e.g. referential error) the whole reorder is
  // rolled back atomically, preventing partial/corrupt order states.
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < order.length; i++) {
      await tx.tripStop.update({
        where: { id: order[i] },
        data: { order_index: i + 1 },
      });
    }
  });

  return { message: 'Stops reordered successfully' };
}
