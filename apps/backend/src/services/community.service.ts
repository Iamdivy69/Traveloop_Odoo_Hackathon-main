import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreatePostInput, UpdatePostInput } from '../schemas/community.schema';

// ─── Author select shape (used consistently) ─────────────────────
const authorSelect = {
  id: true,
  username: true,
  first_name: true,
  last_name: true,
  photo_url: true,
} as const;

// ─── Helper: check if userId can view a private post ─────────────
async function canViewPrivatePost(userId: string, post: { user_id: string }): Promise<boolean> {
  if (userId === post.user_id) return true;
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requester_id: userId, receiver_id: post.user_id },
        { requester_id: post.user_id, receiver_id: userId },
      ],
    },
    select: { id: true },
  });
  return friendship !== null;
}

// ─── Feed ─────────────────────────────────────────────────────────
/**
 * Returns public posts + posts from accepted friends, newest-first.
 * Paginated. Includes hasLiked flag for the requesting user.
 */
export async function getFeed(userId: string, page: number, limit: number) {
  // Gather accepted friend IDs
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requester_id: userId }, { receiver_id: userId }],
      AND: [
        { requester: { deleted_at: null } },
        { receiver: { deleted_at: null } },
      ],
    },
    select: { requester_id: true, receiver_id: true },
  });
  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.receiver_id : f.requester_id
  );

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where: {
        user: { deleted_at: null },
        OR: [
          { is_public: true },
          { user_id: { in: [userId, ...friendIds] } },
        ],
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: authorSelect },
        trip: {
          select: { id: true, name: true, cover_photo_url: true },
        },
        post_likes: {
          where: { user_id: userId },
          select: { id: true },
        },
      },
    }),
    prisma.communityPost.count({
      where: {
        user: { deleted_at: null },
        OR: [
          { is_public: true },
          { user_id: { in: [userId, ...friendIds] } },
        ],
      },
    }),
  ]);

  return {
    items: posts.map((p) => ({
      ...p,
      hasLiked: p.post_likes.length > 0,
      post_likes: undefined,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
  };
}

// ─── Single Post ─────────────────────────────────────────────────
export async function getPost(postId: string, userId: string) {
  const post = await prisma.communityPost.findFirst({
    where: {
      id: postId,
      user: { deleted_at: null },
    },
    include: {
      user: { select: authorSelect },
      trip: { select: { id: true, name: true, cover_photo_url: true } },
      post_likes: {
        where: { user_id: userId },
        select: { id: true },
      },
    },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'Post not found');

  // If private — only owner or accepted friends may view
  if (!post.is_public) {
    const allowed = await canViewPrivatePost(userId, post);
    if (!allowed) throw new AppError(403, 'FORBIDDEN', 'Post is private');
  }

  return {
    ...post,
    hasLiked: post.post_likes.length > 0,
    post_likes: undefined,
  };
}

// ─── Create Post ─────────────────────────────────────────────────
export async function createPost(userId: string, data: CreatePostInput) {
  if (data.trip_id) {
    const trip = await prisma.trip.findFirst({ where: { id: data.trip_id, user_id: userId } });
    if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found or not yours');
  }
  const post = await prisma.communityPost.create({
    data: {
      user_id: userId,
      content: data.content,
      trip_id: data.trip_id ?? null,
      image_url: data.image_url ?? null,
      is_public: data.is_public ?? true,
      likes: 0,
    },
    include: {
      user: { select: authorSelect },
      trip: { select: { id: true, name: true, cover_photo_url: true } },
    },
  });
  return { ...post, hasLiked: false };
}

// ─── Update Post ─────────────────────────────────────────────────
export async function updatePost(postId: string, userId: string, data: UpdatePostInput) {
  const existing = await prisma.communityPost.findFirst({
    where: {
      id: postId,
      user: { deleted_at: null },
    },
  });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Post not found');
  if (existing.user_id !== userId) throw new AppError(403, 'FORBIDDEN', 'Not your post');

  const post = await prisma.communityPost.update({
    where: { id: postId },
    data: {
      ...(data.content !== undefined && { content: data.content }),
      ...(data.image_url !== undefined && { image_url: data.image_url }),
      ...(data.is_public !== undefined && { is_public: data.is_public }),
    },
    include: {
      user: { select: authorSelect },
      trip: { select: { id: true, name: true, cover_photo_url: true } },
      post_likes: { where: { user_id: userId }, select: { id: true } },
    },
  });
  return { ...post, hasLiked: post.post_likes.length > 0, post_likes: undefined };
}

// ─── Delete Post ─────────────────────────────────────────────────
export async function deletePost(postId: string, userId: string) {
  const existing = await prisma.communityPost.findFirst({
    where: {
      id: postId,
      user: { deleted_at: null },
    },
  });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Post not found');
  if (existing.user_id !== userId) throw new AppError(403, 'FORBIDDEN', 'Not your post');
  await prisma.communityPost.delete({ where: { id: postId } });
}

// ─── Toggle Like ─────────────────────────────────────────────────
/**
 * Proper like toggle using PostLike junction table.
 * - Atomically increments/decrements the likes counter.
 * - Enforces visibility: private posts can only be liked by owner or accepted friends.
 * - Each user can only like a post once (@@unique enforced at DB level).
 */
export async function toggleLike(postId: string, userId: string) {
  const post = await prisma.communityPost.findFirst({
    where: {
      id: postId,
      user: { deleted_at: null },
    },
    select: { id: true, user_id: true, is_public: true, likes: true },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'Post not found');

  // IDOR fix: enforce visibility for private posts
  if (!post.is_public) {
    const allowed = await canViewPrivatePost(userId, post);
    if (!allowed) throw new AppError(403, 'FORBIDDEN', 'Cannot like a private post you cannot view');
  }

  const existingLike = await prisma.postLike.findUnique({
    where: { user_id_post_id: { user_id: userId, post_id: postId } },
  });

  if (existingLike) {
    // Unlike: remove the record and decrement counter
    const [, updated] = await prisma.$transaction([
      prisma.postLike.delete({ where: { id: existingLike.id } }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
        select: { id: true, likes: true },
      }),
    ]);
    return { ...updated, hasLiked: false };
  } else {
    // Like: create the record and increment counter
    const [, updated] = await prisma.$transaction([
      prisma.postLike.create({ data: { user_id: userId, post_id: postId } }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
        select: { id: true, likes: true },
      }),
    ]);
    return { ...updated, hasLiked: true };
  }
}

// ─── Discover Users ─────────────────────────────────────────────
export async function discoverUsers(currentUserId: string) {
  return prisma.user.findMany({
    where: {
      is_public: true,
      deleted_at: null,
      NOT: { id: currentUserId },
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      username: true,
      photo_url: true,
      bio: true,
      city: true,
      country: true,
    },
    orderBy: { created_at: 'desc' },
    take: 20,
  });
}
