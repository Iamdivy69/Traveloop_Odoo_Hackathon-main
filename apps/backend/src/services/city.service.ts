import type { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import type {
  CityListQuery,
  CreateCityInput,
  UpdateCityInput,
} from '../schemas/city.schema';

// ─── Public: List Cities ─────────────────────────────────────────
export async function listCities(query: CityListQuery) {
  const where: Prisma.CityWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { country: { contains: query.q, mode: 'insensitive' } },
      { region: { contains: query.q, mode: 'insensitive' } },
    ];
  }
  if (query.country) {
    where.country = { contains: query.country, mode: 'insensitive' };
  }
  if (query.region) {
    where.region = { contains: query.region, mode: 'insensitive' };
  }

  let orderBy: Prisma.CityOrderByWithRelationInput;
  switch (query.sort) {
    case 'cost':
      orderBy = { cost_index: 'asc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    default:
      orderBy = { popularity_score: 'desc' };
  }

  const skip = (query.page - 1) * query.limit;

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: {
        id: true,
        name: true,
        country: true,
        region: true,
        description: true,
        image_url: true,
        cost_index: true,
        popularity_score: true,
        _count: { select: { activities: true, stops: true } },
      },
    }),
    prisma.city.count({ where }),
  ]);

  return {
    items: cities,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
    hasNext: query.page * query.limit < total,
  };
}

// ─── Public: Get City With Activities ───────────────────────────
export async function getCityWithActivities(cityId: string) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: {
      activities: {
        orderBy: [{ cost: 'asc' }, { name: 'asc' }],
        take: 50,
      },
      _count: { select: { activities: true, stops: true } },
    },
  });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');
  return city;
}

// ─── Public: Get Activities For A City (filterable) ─────────────
export async function getCityActivities(
  cityId: string,
  filters: {
    category?: string;
    max_cost?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const cityExists = await prisma.city.findUnique({
    where: { id: cityId },
    select: { id: true },
  });
  if (!cityExists) throw new AppError(404, 'NOT_FOUND', 'City not found');

  const where: Prisma.ActivityWhereInput = { city_id: cityId };
  if (filters.category) {
    where.type = { equals: filters.category, mode: 'insensitive' };
  }
  if (filters.max_cost !== undefined) {
    where.cost = { lte: filters.max_cost };
  }
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }

  return prisma.activity.findMany({
    where,
    orderBy: { cost: 'asc' },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
  });
}

// ─── Admin: Create City ──────────────────────────────────────────
export async function createCity(data: CreateCityInput) {
  const existing = await prisma.city.findFirst({
    where: { name: data.name, country: data.country },
  });
  if (existing) {
    throw new AppError(409, 'CONFLICT', `City '${data.name}' in '${data.country}' already exists`);
  }
  return prisma.city.create({ data });
}

// ─── Admin: Update City ──────────────────────────────────────────
export async function updateCity(cityId: string, data: UpdateCityInput) {
  const existing = await prisma.city.findUnique({ where: { id: cityId } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'City not found');

  return prisma.city.update({ where: { id: cityId }, data });
}

// ─── Admin: Delete City (only if no trip stops reference it) ────
export async function deleteCity(cityId: string) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: { _count: { select: { stops: true, activities: true } } },
  });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');
  if (city._count.stops > 0) {
    throw new AppError(
      409,
      'CONFLICT',
      `Cannot delete city: ${city._count.stops} trip stop(s) reference it. Remove those stops first.`
    );
  }
  if (city._count.activities > 0) {
    throw new AppError(
      409,
      'CITY_IN_USE',
      'Cannot delete city with linked activities'
    );
  }
  await prisma.city.delete({ where: { id: cityId } });
}

// ─── Admin: Add Activity To City ────────────────────────────────
export async function addActivityToCity(cityId: string, data: {
  name: string;
  type: string;
  cost?: number;
  duration_mins?: number;
  description?: string;
  image_url?: string;
}) {
  const city = await prisma.city.findUnique({ where: { id: cityId }, select: { id: true } });
  if (!city) throw new AppError(404, 'NOT_FOUND', 'City not found');

  const duplicate = await prisma.activity.findFirst({
    where: { city_id: cityId, name: { equals: data.name, mode: 'insensitive' } },
  });
  if (duplicate) {
    throw new AppError(409, 'CONFLICT', `Activity '${data.name}' already exists for this city`);
  }

  return prisma.activity.create({
    data: {
      city_id: cityId,
      name: data.name,
      type: data.type,
      cost: data.cost ?? 0,
      duration_mins: data.duration_mins,
      description: data.description,
      image_url: data.image_url,
    },
  });
}

// ─── Admin: Update Activity ──────────────────────────────────────
export async function updateActivity(activityId: string, data: {
  name?: string;
  type?: string;
  cost?: number;
  duration_mins?: number;
  description?: string;
  image_url?: string;
}) {
  const existing = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Activity not found');

  return prisma.activity.update({ where: { id: activityId }, data });
}

// ─── Admin: Delete Activity ──────────────────────────────────────
export async function deleteActivity(activityId: string) {
  const existing = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Activity not found');

  // StopActivity uses onDelete: Restrict for activity — check for references first
  const inUse = await prisma.stopActivity.count({ where: { activity_id: activityId } });
  if (inUse > 0) {
    throw new AppError(
      409,
      'CONFLICT',
      `Cannot delete activity: it is referenced by ${inUse} itinerary stop(s).`
    );
  }
  await prisma.activity.delete({ where: { id: activityId } });
}
