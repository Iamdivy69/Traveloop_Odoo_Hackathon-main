import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

// Helper to verify trip ownership
async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, user_id: userId } });
  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found or unauthorized');
  return trip;
}

export async function getNotes(tripId: string, userId: string, stopId?: string) {
  await verifyTripOwnership(tripId, userId);
  
  const where: any = { trip_id: tripId };
  if (stopId) where.stop_id = stopId;

  return await prisma.tripNote.findMany({
    where,
    orderBy: { created_at: 'desc' }
  });
}

export async function createNote(tripId: string, userId: string, content: string, stopId?: string) {
  await verifyTripOwnership(tripId, userId);
  
  if (!content) throw new AppError(400, 'BAD_REQUEST', 'Content is required');

  if (stopId) {
    const stop = await prisma.tripStop.findFirst({ where: { id: stopId, trip_id: tripId } });
    if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');
  }

  return await prisma.tripNote.create({
    data: {
      trip_id: tripId,
      stop_id: stopId || null,
      content
    }
  });
}

export async function getNote(tripId: string, userId: string, noteId: string) {
  await verifyTripOwnership(tripId, userId);
  
  const note = await prisma.tripNote.findFirst({ where: { id: noteId, trip_id: tripId } });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');
  
  return note;
}

export async function updateNote(tripId: string, userId: string, noteId: string, content: string) {
  await verifyTripOwnership(tripId, userId);
  
  const note = await prisma.tripNote.findFirst({ where: { id: noteId, trip_id: tripId } });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');

  return await prisma.tripNote.update({
    where: { id: noteId },
    data: { content }
  });
}

export async function deleteNote(tripId: string, userId: string, noteId: string) {
  await verifyTripOwnership(tripId, userId);
  
  const note = await prisma.tripNote.findFirst({ where: { id: noteId, trip_id: tripId } });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');

  await prisma.tripNote.delete({ where: { id: noteId } });
}
