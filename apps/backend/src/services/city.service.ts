import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export async function searchCities(q?: string, country?: string, limit = 20, offset = 0) {
  const where: any = {};

  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }
  if (country) {
    where.country = { contains: country, mode: 'insensitive' };
  }

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      orderBy: { popularity_score: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        country: true,
        region: true,
        cost_index: true,
        popularity_score: true,
        description: true,
        image_url: true,
      }
    }),
    prisma.city.count({ where }),
  ]);

  return {
    items: cities,
    total,
    limit,
    offset
  };
}

export async function getCityById(cityId: string) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: { 
      activities: {
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ]
      } 
    },
  });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');
  return city;
}

export async function getCityActivities(cityId: string, type?: string, minCost?: number, maxCost?: number, limit = 50, offset = 0) {
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');

  const where: any = { city_id: cityId };
  if (type) where.type = type;
  
  if (minCost !== undefined || maxCost !== undefined) {
    where.cost = {};
    if (minCost !== undefined) where.cost.gte = minCost;
    if (maxCost !== undefined) where.cost.lte = maxCost;
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset
    }),
    prisma.activity.count({ where })
  ]);

  return {
    items: activities,
    total,
    limit,
    offset
  };
}
