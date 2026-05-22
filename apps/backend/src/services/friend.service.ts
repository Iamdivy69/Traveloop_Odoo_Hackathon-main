import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from './notification.service';

export type FriendshipStatus =
  | 'none'
  | 'requested_by_me'
  | 'requested_by_them'
  | 'friends';

// ─── Send Friend Request ─────────────────────────────────────────
export async function sendFriendRequest(requesterId: string, receiverId: string) {
  if (requesterId === receiverId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'You cannot send a friend request to yourself');
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, deleted_at: true },
  });
  if (!receiver || receiver.deleted_at !== null) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  // Check for any existing relationship in either direction
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requester_id: requesterId, receiver_id: receiverId },
        { requester_id: receiverId, receiver_id: requesterId },
      ],
    },
  });

  if (existing) {
    if (existing.status === 'ACCEPTED') {
      throw new AppError(409, 'CONFLICT', 'You are already friends');
    }
    if (existing.status === 'PENDING') {
      throw new AppError(409, 'CONFLICT', 'A pending friend request already exists');
    }
    // DECLINED — allow re-request by updating status
    return prisma.friendship.update({
      where: { id: existing.id },
      data: { requester_id: requesterId, receiver_id: receiverId, status: 'PENDING' },
    });
  }

  return prisma.friendship.create({
    data: { requester_id: requesterId, receiver_id: receiverId, status: 'PENDING' },
  }).then(async (friendship) => {
    // Notify receiver of the new request (best-effort, non-blocking)
    createNotification({
      userId: receiverId,
      type: 'FRIEND_REQUEST',
      message: 'You have a new friend request.',
    }).catch(() => undefined);
    return friendship;
  });
}

// ─── Accept Friend Request ───────────────────────────────────────
export async function acceptFriendRequest(requestId: string, userId: string) {
  const request = await prisma.friendship.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError(404, 'NOT_FOUND', 'Friend request not found');
  if (request.receiver_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot accept this request');
  }
  if (request.status !== 'PENDING') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request is not pending');
  }
  const friendship = await prisma.friendship.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } });
  // Notify requester that their request was accepted (best-effort, non-blocking)
  createNotification({
    userId: friendship.requester_id,
    type: 'FRIEND_ACCEPTED',
    message: 'Your friend request was accepted.',
  }).catch(() => undefined);
  return friendship;
}

// ─── Decline Friend Request ──────────────────────────────────────
export async function declineFriendRequest(requestId: string, userId: string) {
  const request = await prisma.friendship.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError(404, 'NOT_FOUND', 'Friend request not found');
  if (request.receiver_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot decline this request');
  }
  return prisma.friendship.update({ where: { id: requestId }, data: { status: 'DECLINED' } });
}

// ─── Unfriend ────────────────────────────────────────────────────
export async function unfriend(friendshipId: string, userId: string) {
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) throw new AppError(404, 'NOT_FOUND', 'Friendship not found');
  if (friendship.requester_id !== userId && friendship.receiver_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your friendship');
  }
  await prisma.friendship.delete({ where: { id: friendshipId } });
}

// ─── My Friends ──────────────────────────────────────────────────
export async function getMyFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requester_id: userId }, { receiver_id: userId }],
      // Exclude friendships where the other party has been soft-deleted
      AND: [
        { requester: { deleted_at: null } },
        { receiver: { deleted_at: null } },
      ],
    },
    include: {
      requester: { select: { id: true, username: true, first_name: true, last_name: true, photo_url: true } },
      receiver: { select: { id: true, username: true, first_name: true, last_name: true, photo_url: true } },
    },
  });

  return friendships.map((f) => ({
    friendshipId: f.id,
    friend: f.requester_id === userId ? f.receiver : f.requester,
    since: f.updated_at,
  }));
}

// ─── Incoming Requests ───────────────────────────────────────────
export async function getIncomingRequests(userId: string) {
  return prisma.friendship.findMany({
    where: {
      receiver_id: userId,
      status: 'PENDING',
      // Hide requests from soft-deleted accounts
      requester: { deleted_at: null },
    },
    include: {
      requester: { select: { id: true, username: true, first_name: true, last_name: true, photo_url: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

// ─── Friendship Status ───────────────────────────────────────────
export async function getFriendshipStatus(
  userId: string,
  targetId: string
): Promise<{ status: FriendshipStatus; requestId: string | null }> {
  if (userId === targetId) return { status: 'none', requestId: null };

  const row = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requester_id: userId, receiver_id: targetId },
        { requester_id: targetId, receiver_id: userId },
      ],
      requester: { deleted_at: null },
      receiver: { deleted_at: null },
    },
  });

  if (!row) return { status: 'none', requestId: null };
  if (row.status === 'ACCEPTED') return { status: 'friends', requestId: row.id };
  if (row.status === 'PENDING') {
    const mine = row.requester_id === userId;
    return {
      status: mine ? 'requested_by_me' : 'requested_by_them',
      requestId: row.id,
    };
  }
  return { status: 'none', requestId: null };
}

