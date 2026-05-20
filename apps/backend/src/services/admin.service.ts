import prisma from '../db/prisma';

export async function getStats() {
  const [total_users, total_trips, public_trips, total_cities] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.trip.count({ where: { is_public: true } }),
    prisma.city.count()
  ]);

  // most visited cities
  const mostVisited = await prisma.tripStop.groupBy({
    by: ['city_id'],
    _count: { city_id: true },
    orderBy: { _count: { city_id: 'desc' } },
    take: 5
  });

  const cityIds = mostVisited.map(m => m.city_id);
  const cities = await prisma.city.findMany({ where: { id: { in: cityIds } } });

  const most_visited_cities = mostVisited.map(mv => {
    const city = cities.find(c => c.id === mv.city_id);
    return {
      city: city ? city.name : 'Unknown',
      count: mv._count.city_id
    };
  });

  return {
    total_users,
    total_trips,
    public_trips,
    total_cities,
    most_visited_cities
  };
}

export async function getUsers(page = 1, limit = 20) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { trips: true } }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.user.count()
  ]);

  return {
    items: users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }),
    total,
    limit,
    offset: (page - 1) * limit
  };
}

export async function createCity(data: any) {
  return await prisma.city.create({
    data: {
      name: data.name,
      country: data.country,
      region: data.region,
      cost_index: data.cost_index || 0,
      popularity_score: data.popularity_score || 0,
      description: data.description,
      image_url: data.image_url
    }
  });
}

export async function addActivityToCity(cityId: string, data: any) {
  return await prisma.activity.create({
    data: {
      city_id: cityId,
      name: data.name,
      type: data.type,
      cost: data.cost || 0,
      duration_mins: data.duration_mins,
      description: data.description,
      image_url: data.image_url
    }
  });
}

export async function deleteUser(userId: string) {
  return await prisma.user.delete({ where: { id: userId } });
}
