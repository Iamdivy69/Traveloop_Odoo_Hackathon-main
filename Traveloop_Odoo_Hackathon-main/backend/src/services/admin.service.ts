import prisma from '../db/prisma';

export async function getStats() {
  const [totalUsers, totalTrips, totalCities] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.city.count(),
  ]);

  const popularCities = await prisma.city.findMany({
    orderBy: { popularity_score: 'desc' },
    take: 10,
    select: { id: true, name: true, country: true, popularity_score: true },
  });

  return { totalUsers, totalTrips, totalCities, popularCities };
}

export async function listUsers(page = 1, limit = 20) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, first_name: true, last_name: true, email: true, phone: true, city: true, country: true, created_at: true, is_admin: true, _count: { select: { trips: true } } },
      orderBy: { created_at: 'desc' },
    }),
    prisma.user.count(),
  ]);
  return { data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function listAllTrips(page = 1, limit = 20) {
  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
        _count: { select: { stops: true, packing_items: true, notes: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.trip.count(),
  ]);
  return { data: trips, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
