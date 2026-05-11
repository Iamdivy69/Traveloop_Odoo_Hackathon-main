import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { verifyTripOwnership } from './trip.service';

export async function listPackingItems(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);
  const items = await prisma.packingItem.findMany({
    where: { trip_id: tripId },
    orderBy: [{ category: 'asc' }, { created_at: 'asc' }],
  });
  // Group by category
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }
  return grouped;
}

export async function createPackingItem(tripId: string, userId: string, data: { name: string; category: string }) {
  await verifyTripOwnership(tripId, userId);
  return prisma.packingItem.create({ data: { trip_id: tripId, name: data.name, category: data.category } });
}

export async function updatePackingItem(tripId: string, itemId: string, userId: string, data: { name?: string; category?: string; is_packed?: boolean }) {
  await verifyTripOwnership(tripId, userId);
  const item = await prisma.packingItem.findFirst({ where: { id: itemId, trip_id: tripId } });
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Packing item not found');
  return prisma.packingItem.update({ where: { id: itemId }, data });
}

export async function deletePackingItem(tripId: string, itemId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);
  const item = await prisma.packingItem.findFirst({ where: { id: itemId, trip_id: tripId } });
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Packing item not found');
  await prisma.packingItem.delete({ where: { id: itemId } });
  return { message: 'Packing item deleted' };
}

export async function resetChecklist(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);
  await prisma.packingItem.updateMany({ where: { trip_id: tripId }, data: { is_packed: false } });
  return { message: 'Packing checklist reset' };
}
