import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { verifyTripOwnership } from './trip.service';

export async function listStops(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);

  const stops = await prisma.tripStop.findMany({
    where: { trip_id: tripId },
    include: {
      city: true,
      activities: { include: { activity: true } },
    },
    orderBy: { order_index: 'asc' },
  });

  return stops;
}

export async function createStop(tripId: string, userId: string, data: {
  city_id: string;
  arrival_date: string;
  departure_date: string;
}) {
  const trip = await verifyTripOwnership(tripId, userId);

  // Verify city exists
  const city = await prisma.city.findUnique({ where: { id: data.city_id } });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');

  // Validate dates within trip range
  const arrival = new Date(data.arrival_date);
  const departure = new Date(data.departure_date);
  const tripStart = new Date(trip.start_date);
  const tripEnd = new Date(trip.end_date);

  if (arrival < tripStart || arrival > tripEnd) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Arrival date must be within the trip date range');
  }
  if (departure < arrival || departure > tripEnd) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Departure date must be after arrival and within the trip date range');
  }

  // Auto-assign next order_index
  const maxOrder = await prisma.tripStop.aggregate({
    where: { trip_id: tripId },
    _max: { order_index: true },
  });
  const nextOrder = (maxOrder._max.order_index || 0) + 1;

  const stop = await prisma.tripStop.create({
    data: {
      trip_id: tripId,
      city_id: data.city_id,
      arrival_date: arrival,
      departure_date: departure,
      order_index: nextOrder,
    },
    include: { city: true },
  });

  return stop;
}

export async function updateStop(tripId: string, stopId: string, userId: string, data: {
  arrival_date?: string;
  departure_date?: string;
}) {
  await verifyTripOwnership(tripId, userId);

  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, trip_id: tripId },
  });
  if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');

  const updateData: any = {};
  if (data.arrival_date) updateData.arrival_date = new Date(data.arrival_date);
  if (data.departure_date) updateData.departure_date = new Date(data.departure_date);

  const updated = await prisma.tripStop.update({
    where: { id: stopId },
    data: updateData,
    include: { city: true },
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

  // Update each stop's order_index in a transaction
  await prisma.$transaction(
    order.map((stopId, index) =>
      prisma.tripStop.update({
        where: { id: stopId },
        data: { order_index: index + 1 },
      })
    )
  );

  return { message: 'Stops reordered successfully' };
}
