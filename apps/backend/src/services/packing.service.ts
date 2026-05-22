import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export const SUGGESTED_CATEGORIES = [
  'Clothing',
  'Documents',
  'Electronics',
  'Toiletries',
  'Medicine',
  'Snacks',
  'Other',
];

async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, user_id: userId } });
  if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found or unauthorized');
  return trip;
}

export async function getItemsGroupedByCategory(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);

  const items = await prisma.packingItem.findMany({
    where: { trip_id: tripId },
    orderBy: { created_at: 'asc' },
  });

  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return grouped;
}

export async function addPackingItem(
  tripId: string,
  userId: string,
  data: { name: string; category?: string; is_packed?: boolean }
) {
  await verifyTripOwnership(tripId, userId);
  const category = data.category || 'Other';

  return await prisma.packingItem.create({
    data: {
      trip_id: tripId,
      name: data.name,
      category,
      is_packed: data.is_packed ?? false,
    },
  });
}

export async function updatePackingItem(
  tripId: string,
  userId: string,
  itemId: string,
  data: { name?: string; category?: string; is_packed?: boolean }
) {
  await verifyTripOwnership(tripId, userId);

  const item = await prisma.packingItem.findFirst({ where: { id: itemId, trip_id: tripId } });
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Packing item not found');

  return await prisma.packingItem.update({
    where: { id: itemId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.is_packed !== undefined && { is_packed: data.is_packed }),
    },
  });
}

export async function deletePackingItem(tripId: string, userId: string, itemId: string) {
  await verifyTripOwnership(tripId, userId);

  const item = await prisma.packingItem.findFirst({ where: { id: itemId, trip_id: tripId } });
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Packing item not found');

  await prisma.packingItem.delete({ where: { id: itemId } });
}

export async function bulkTogglePacked(
  tripId: string,
  userId: string,
  ids: string[],
  isPacked: boolean
) {
  await verifyTripOwnership(tripId, userId);

  await prisma.$transaction(
    ids.map((id) =>
      prisma.packingItem.updateMany({
        where: { id, trip_id: tripId },
        data: { is_packed: isPacked },
      })
    )
  );

  return getItemsGroupedByCategory(tripId, userId);
}

export async function deleteAllPacked(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);

  const result = await prisma.packingItem.deleteMany({
    where: { trip_id: tripId, is_packed: true },
  });

  return { deleted: result.count };
}

export async function getPackingProgress(tripId: string, userId: string) {
  await verifyTripOwnership(tripId, userId);

  const items = await prisma.packingItem.findMany({
    where: { trip_id: tripId },
    select: { is_packed: true },
  });

  const total = items.length;
  const packed = items.filter((i) => i.is_packed).length;
  const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;

  return { total, packed, percentage };
}

export async function bulkCreateItems(
  tripId: string,
  userId: string,
  items: Array<{ name: string; category: string }>
) {
  await verifyTripOwnership(tripId, userId);

  const data = items.map((item) => ({
    trip_id: tripId,
    name: item.name,
    category: item.category || 'Other',
    is_packed: false,
  }));

  await prisma.packingItem.createMany({ data });
  return getItemsGroupedByCategory(tripId, userId);
}
