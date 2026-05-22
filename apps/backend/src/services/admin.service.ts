import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getStats() {
  const now = new Date();
  const [totalUsers, totalTrips, totalCities, totalPosts, newUsersThisWeek, activeTrips] = await Promise.all([
    prisma.user.count({ where: { deleted_at: null } }),
    prisma.trip.count({ where: { user: { deleted_at: null } } }),
    prisma.city.count(),
    prisma.communityPost.count({ where: { user: { deleted_at: null } } }),
    prisma.user.count({
      where: {
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        deleted_at: null
      }
    }),
    prisma.trip.count({
      where: {
        start_date: { lte: now },
        end_date: { gte: now },
        user: { deleted_at: null }
      }
    })
  ]);

  // most visited cities
  const mostVisited = await prisma.tripStop.groupBy({
    by: ['city_id'],
    _count: { city_id: true },
    orderBy: { _count: { city_id: 'desc' } },
    take: 5
  });

  const cityIds = mostVisited.map(m => m.city_id).filter((id): id is string => id !== null);
  const cities = await prisma.city.findMany({ where: { id: { in: cityIds } } });

  const most_visited_cities = mostVisited.map(mv => {
    const city = cities.find(c => c.id === mv.city_id);
    return {
      city: city ? city.name : 'Unknown',
      count: mv._count.city_id
    };
  });

  return {
    totalUsers,
    totalTrips,
    totalCities,
    totalPosts,
    newUsersThisWeek,
    activeTrips,
    most_visited_cities
  };
}

export async function getUsers(page = 1, limit = 20, search = '') {
  const where: any = { deleted_at: null };
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { first_name: { contains: search, mode: 'insensitive' } },
      { last_name: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { trips: true } }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.user.count({ where })
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

export async function toggleAdmin(userId: string, currentAdminId: string) {
  if (userId === currentAdminId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'You cannot toggle your own admin status to prevent lockout');
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { is_admin: !user.is_admin },
    select: { id: true, username: true, is_admin: true }
  });
}

export async function getPosts(page = 1, limit = 20) {
  const where = { user: { deleted_at: null } };
  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            photo_url: true,
          }
        },
        trip: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.communityPost.count({ where })
  ]);

  return {
    items: posts,
    total,
    limit,
    offset: (page - 1) * limit
  };
}

export async function deletePost(postId: string) {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) {
    throw new AppError(404, 'NOT_FOUND', 'Post not found');
  }
  return await prisma.communityPost.delete({ where: { id: postId } });
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

export async function deleteUser(userId: string, currentAdminId: string) {
  if (userId === currentAdminId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'You cannot delete your own account');
  }

  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      deleted_at: null
    },
    data: {
      deleted_at: new Date(),
      token_version: { increment: 1 } // Invalidate active JWT sessions
    }
  });

  if (result.count === 0) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
}

export async function suspendUser(userId: string, currentAdminId: string, reason?: string) {
  if (userId === currentAdminId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'You cannot suspend your own account');
  }

  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      deleted_at: null,
      is_suspended: false
    },
    data: {
      is_suspended: true,
      suspended_at: new Date(),
      suspension_reason: reason || null,
      token_version: { increment: 1 } // Invalidate active JWT sessions
    }
  });

  if (result.count === 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deleted_at: true, is_suspended: true }
    });
    if (!user || user.deleted_at !== null) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    if (user.is_suspended) {
      throw new AppError(400, 'VALIDATION_ERROR', 'User is already suspended');
    }
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, is_suspended: true, suspended_at: true, suspension_reason: true }
  });
  return updatedUser!;
}

export async function restoreUser(userId: string, currentAdminId: string) {
  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      deleted_at: null,
      is_suspended: true
    },
    data: {
      is_suspended: false,
      suspended_at: null,
      suspension_reason: null
    }
  });

  if (result.count === 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deleted_at: true, is_suspended: true }
    });
    if (!user || user.deleted_at !== null) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    if (!user.is_suspended) {
      throw new AppError(400, 'VALIDATION_ERROR', 'User is not suspended');
    }
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, is_suspended: true }
  });
  return updatedUser!;
}
