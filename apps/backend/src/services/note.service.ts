import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

function isValidUrl(url: string) {
  if (url.startsWith('data:image/')) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, user_id: userId } });
  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found or unauthorized');
  return trip;
}

export async function getNotes(tripId: string, userId: string, stopId?: string) {
  await verifyTripOwnership(tripId, userId);

  const where: Record<string, unknown> = { trip_id: tripId };
  if (stopId) where.stop_id = stopId;

  return await prisma.tripNote.findMany({
    where,
    include: {
      stop: {
        include: { city: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function createNote(
  tripId: string,
  userId: string,
  data: { content: string; stop_id?: string; title?: string; image_url?: string }
) {
  await verifyTripOwnership(tripId, userId);

  if (!data.content) throw new AppError(400, 'BAD_REQUEST', 'Content is required');

  if (data.image_url && !isValidUrl(data.image_url)) {
    throw new AppError(400, 'BAD_REQUEST', 'image_url must be a valid URL');
  }

  if (data.stop_id) {
    const stop = await prisma.tripStop.findFirst({ where: { id: data.stop_id, trip_id: tripId } });
    if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');
  }

  return await prisma.tripNote.create({
    data: {
      trip_id: tripId,
      stop_id: data.stop_id || null,
      content: data.content,
      image_url: data.image_url || null,
    },
    include: { stop: { include: { city: true } } },
  });
}

export async function getNote(tripId: string, userId: string, noteId: string) {
  await verifyTripOwnership(tripId, userId);

  const note = await prisma.tripNote.findFirst({
    where: { id: noteId, trip_id: tripId },
    include: { stop: { include: { city: true } } },
  });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');

  return note;
}

export async function updateNote(
  tripId: string,
  userId: string,
  noteId: string,
  data: { content?: string; stop_id?: string | null; title?: string; image_url?: string | null }
) {
  await verifyTripOwnership(tripId, userId);

  const note = await prisma.tripNote.findFirst({ where: { id: noteId, trip_id: tripId } });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');

  if (data.image_url && !isValidUrl(data.image_url)) {
    throw new AppError(400, 'BAD_REQUEST', 'image_url must be a valid URL');
  }

  if (data.stop_id) {
    const stop = await prisma.tripStop.findFirst({ where: { id: data.stop_id, trip_id: tripId } });
    if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');
  }

  return await prisma.tripNote.update({
    where: { id: noteId },
    data: {
      ...(data.content !== undefined && { content: data.content }),
      ...(data.stop_id !== undefined && { stop_id: data.stop_id }),
      ...(data.image_url !== undefined && { image_url: data.image_url }),
    },
    include: { stop: { include: { city: true } } },
  });
}

export async function deleteNote(tripId: string, userId: string, noteId: string) {
  await verifyTripOwnership(tripId, userId);

  const note = await prisma.tripNote.findFirst({ where: { id: noteId, trip_id: tripId } });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');

  await prisma.tripNote.delete({ where: { id: noteId } });
}
