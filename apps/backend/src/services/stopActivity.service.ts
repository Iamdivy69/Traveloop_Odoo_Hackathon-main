import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { verifyTripOwnership, calculateBudget } from './trip.service';
import type { AddStopActivityInput, UpdateStopActivityInput } from '../schemas/activity.schema';

async function verifyStopOwnership(tripId: string, stopId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);
  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, trip_id: tripId },
  });
  if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');
  return stop;
}

export async function listStopActivities(tripId: string, stopId: string, userId: string) {
  await verifyStopOwnership(tripId, stopId, userId);
  return prisma.stopActivity.findMany({
    where: { stop_id: stopId },
    include: { activity: true },
    orderBy: { scheduled_time: 'asc' },
  });
}

export async function addStopActivity(
  tripId: string,
  stopId: string,
  userId: string,
  data: AddStopActivityInput
) {
  const stop = await verifyStopOwnership(tripId, stopId, userId);

  if (data.activity_id) {
    // Branch 1: linking an existing Activity from the city catalogue
    const activity = await prisma.activity.findUnique({ where: { id: data.activity_id } });
    if (!activity) throw new AppError(404, 'NOT_FOUND', 'Activity not found');
    if (activity.city_id !== stop.city_id) {
      throw new AppError(422, 'VALIDATION_ERROR', "Activity does not belong to this stop's city");
    }

    return prisma.stopActivity.create({
      data: {
        stop_id: stopId,
        activity_id: data.activity_id,
        scheduled_time: data.scheduled_time,
        custom_cost: data.custom_cost,
        notes: data.notes,
      },
      include: { activity: true },
    });
  }

  // Branch 2: fully custom activity (no city catalogue link)
  return prisma.stopActivity.create({
    data: {
      stop_id: stopId,
      activity_id: null,
      custom_title: data.custom_title,
      scheduled_time: data.scheduled_time,
      custom_cost: data.custom_cost,
      notes: data.notes,
    },
    include: { activity: true },
  });
}

export async function updateStopActivity(
  tripId: string,
  stopId: string,
  saId: string,
  userId: string,
  data: UpdateStopActivityInput
) {
  await verifyStopOwnership(tripId, stopId, userId);
  const sa = await prisma.stopActivity.findFirst({ where: { id: saId, stop_id: stopId } });
  if (!sa) throw new AppError(404, 'NOT_FOUND', 'Stop activity not found');

  return prisma.stopActivity.update({
    where: { id: saId },
    data: {
      ...(data.scheduled_time !== undefined && { scheduled_time: data.scheduled_time }),
      ...(data.custom_cost !== undefined && { custom_cost: data.custom_cost }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { activity: true },
  });
}

export async function deleteStopActivity(
  tripId: string,
  stopId: string,
  saId: string,
  userId: string
) {
  await verifyStopOwnership(tripId, stopId, userId);
  const sa = await prisma.stopActivity.findFirst({ where: { id: saId, stop_id: stopId } });
  if (!sa) throw new AppError(404, 'NOT_FOUND', 'Stop activity not found');
  await prisma.stopActivity.delete({ where: { id: saId } });
  return { message: 'Activity removed from stop' };
}

/**
 * FIX (Fragmented Budget Logic): The old duplicate getBudgetBreakdown
 * calculation has been removed. All callers now use the canonical
 * calculateBudget() from trip.service.ts so that both engines stay in sync.
 */
export { calculateBudget as getBudgetBreakdown } from './trip.service';
