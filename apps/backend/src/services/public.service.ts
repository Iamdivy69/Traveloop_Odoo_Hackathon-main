import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getSharedTrip(token: string) {
  const trip = await prisma.trip.findFirst({
    where: { share_token: token, is_public: true },
    include: {
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true }
          }
        },
        orderBy: { order_index: 'asc' }
      }
    }
  });

  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found or not public');
  
  return trip;
}

export async function copySharedTrip(token: string, newUserId: string) {
  const sourceTrip = await getSharedTrip(token);
  
  // Duplicate the trip
  const newTrip = await prisma.trip.create({
    data: {
      user_id: newUserId,
      name: `Copy of ${sourceTrip.name}`,
      description: sourceTrip.description,
      start_date: sourceTrip.start_date,
      end_date: sourceTrip.end_date,
      cover_photo_url: sourceTrip.cover_photo_url,
      total_budget: sourceTrip.total_budget,
      is_public: false,
    }
  });

  // Duplicate stops and stop_activities
  for (const stop of sourceTrip.stops) {
    const newStop = await prisma.tripStop.create({
      data: {
        trip_id: newTrip.id,
        city_id: stop.city_id,
        arrival_date: stop.arrival_date,
        departure_date: stop.departure_date,
        order_index: stop.order_index
      }
    });

    if (stop.activities && stop.activities.length > 0) {
      await prisma.stopActivity.createMany({
        data: stop.activities.map((sa) => ({
          stop_id: newStop.id,
          activity_id: sa.activity_id,
          scheduled_time: sa.scheduled_time,
          custom_cost: sa.custom_cost,
          notes: sa.notes
        }))
      });
    }
  }

  return await prisma.trip.findUnique({
    where: { id: newTrip.id },
    include: {
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true }
          }
        },
        orderBy: { order_index: 'asc' }
      }
    }
  });
}
