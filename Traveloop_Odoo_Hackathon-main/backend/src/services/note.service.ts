import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { verifyTripOwnership } from './trip.service';

export async function listNotes(tripId: string, userId: string, stopId?: string) {
  await verifyTripOwnership(tripId, userId);
  const where: any = { trip_id: tripId };
  if (stopId) where.stop_id = stopId;
  return prisma.tripNote.findMany({ where, orderBy: { created_at: 'desc' } });
}

export async function createNote(tripId: string, userId: string, data: { content: string; stop_id?: string }) {
  await verifyTripOwnership(tripId, userId);
  if (data.stop_id) {
    const stop = await prisma.tripStop.findFirst({ where: { id: data.stop_id, trip_id: tripId } });
    if (!stop) throw new AppError(404, 'NOT_FOUND', 'Stop not found');
  }
  return prisma.tripNote.create({ data: { trip_id: tripId, content: data.content, stop_id: data.stop_id } });
}

export async function updateNote(tripId: string, noteId: string, userId: string, data: { content: string }) {
  await verifyTripOwnership(tripId, userId);
  const note = await prisma.tripNote.findFirst({ where: { id: noteId, trip_id: tripId } });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');
  return prisma.tripNote.update({ where: { id: noteId }, data: { content: data.content } });
}

export async function deleteNote(tripId: string, noteId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);
  const note = await prisma.tripNote.findFirst({ where: { id: noteId, trip_id: tripId } });
  if (!note) throw new AppError(404, 'NOT_FOUND', 'Note not found');
  await prisma.tripNote.delete({ where: { id: noteId } });
  return { message: 'Note deleted' };
}
