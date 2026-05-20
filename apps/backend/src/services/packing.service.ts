import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

// Helper to verify trip ownership
async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, user_id: userId } });
  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found or unauthorized');
  return trip;
}

export async function getPackingItems(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);
  
  const items = await prisma.packingItem.findMany({
    where: { trip_id: tripId },
    orderBy: { created_at: 'asc' }
  });

  // Group by category
  const grouped = items.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return grouped;
}

export async function addPackingItem(tripId: string, userId: string, data: { name: string, category?: string, is_packed?: boolean }) {
  await verifyTripOwnership(tripId, userId);

  const category = data.category || 'other';
  const validCategories = ['clothing', 'toiletries', 'electronics', 'documents', 'medicine', 'food', 'other'];
  
  return await prisma.packingItem.create({
    data: {
      trip_id: tripId,
      name: data.name,
      category: validCategories.includes(category) ? category : 'other',
      is_packed: data.is_packed || false,
    }
  });
}

export async function updatePackingItem(tripId: string, userId: string, itemId: string, data: { name?: string, is_packed?: boolean }) {
  await verifyTripOwnership(tripId, userId);
  
  const item = await prisma.packingItem.findFirst({ where: { id: itemId, trip_id: tripId } });
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Packing item not found');

  return await prisma.packingItem.update({
    where: { id: itemId },
    data: {
      name: data.name !== undefined ? data.name : undefined,
      is_packed: data.is_packed !== undefined ? data.is_packed : undefined
    }
  });
}

export async function deletePackingItem(tripId: string, userId: string, itemId: string) {
  await verifyTripOwnership(tripId, userId);
  
  const item = await prisma.packingItem.findFirst({ where: { id: itemId, trip_id: tripId } });
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Packing item not found');

  await prisma.packingItem.delete({ where: { id: itemId } });
}

export async function bulkCreateItems(tripId: string, userId: string, items: Array<{ name: string, category: string }>) {
  await verifyTripOwnership(tripId, userId);

  const validCategories = ['clothing', 'toiletries', 'electronics', 'documents', 'medicine', 'food', 'other'];
  
  const data = items.map(item => ({
    trip_id: tripId,
    name: item.name,
    category: validCategories.includes(item.category) ? item.category : 'other',
    is_packed: false
  }));

  await prisma.packingItem.createMany({ data });
  return await getPackingItems(tripId, userId);
}
