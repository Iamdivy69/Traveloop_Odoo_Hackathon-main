import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export async function searchCities(query?: string, region?: string, sort?: string, page = 1, limit = 20) {
  const where: any = {};

  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }
  if (region) {
    where.region = { contains: region, mode: 'insensitive' };
  }

  const orderBy: any = sort === 'popularity'
    ? { popularity_score: 'desc' }
    : sort === 'cost'
    ? { cost_index: 'asc' }
    : { name: 'asc' };

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.city.count({ where }),
  ]);

  return {
    data: cities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCityById(cityId: string) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: { _count: { select: { activities: true } } },
  });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');
  return city;
}

export async function getCityActivities(cityId: string, type?: string, maxCost?: number) {
  // Verify city exists
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');

  const where: any = { city_id: cityId };
  if (type) where.type = type;
  if (maxCost !== undefined) where.cost = { lte: maxCost };

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return activities;
}
