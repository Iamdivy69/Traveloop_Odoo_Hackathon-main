import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export async function generateInvoice(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      user: true,
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true }
          }
        },
        orderBy: { order_index: 'asc' }
      },
      expenses: {
        orderBy: { created_at: 'asc' }
      }
    }
  });

  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');

  const tripTitle = trip.name;
  const dateRange = trip.start_date && trip.end_date 
    ? `${trip.start_date.toLocaleDateString()} - ${trip.end_date.toLocaleDateString()}` 
    : 'Dates TBD';
  const travelerName = `${trip.user.first_name} ${trip.user.last_name}`;
  const generatedAt = new Date().toISOString();

  let subtotalCents = 0;
  const currency = trip.expenses.length > 0 ? trip.expenses[0].currency : 'INR';
  const categoryMapCents: Record<string, number> = {};

  const stopsData = trip.stops.map(stop => {
    return {
      location: stop.city ? `${stop.city.name}, ${stop.city.country}` : (stop.custom_city_name || 'Custom Stop'),
      dates: `${stop.arrival_date.toLocaleDateString()} - ${stop.departure_date.toLocaleDateString()}`,
      activities: stop.activities.map(sa => {
        const cost = sa.custom_cost ? Number(sa.custom_cost) : (sa.activity ? Number(sa.activity.cost) : 0);
        return {
          name: sa.custom_title || (sa.activity ? sa.activity.name : 'Unknown Activity'),
          cost,
        };
      })
    };
  });

  const expensesData = trip.expenses.map(exp => {
    const amt = Number(exp.amount);
    const amtCents = Math.round(amt * 100);
    subtotalCents += amtCents;
    categoryMapCents[exp.category] = (categoryMapCents[exp.category] || 0) + amtCents;

    return {
      title: exp.title,
      category: exp.category,
      amount: amt,
      date: exp.created_at.toISOString(),
    };
  });

  const byCategory = Object.keys(categoryMapCents).map(cat => ({
    category: cat,
    total: categoryMapCents[cat] / 100
  }));

  return {
    tripTitle,
    dateRange,
    travelerName,
    generatedAt,
    stops: stopsData,
    expenses: expensesData,
    summary: {
      subtotal: subtotalCents / 100,
      currency,
      byCategory,
    }
  };
}
