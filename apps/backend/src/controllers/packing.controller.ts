import { Request, Response, NextFunction } from 'express';
import * as packingService from '../services/packing.service';
import { p } from '../utils/params';

export async function getPackingItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await packingService.getItemsGroupedByCategory(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

export async function addPackingItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await packingService.addPackingItem(p(req, 'id'), req.user!.id, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function updatePackingItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await packingService.updatePackingItem(p(req, 'id'), req.user!.id, p(req, 'itemId'), req.body);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function deletePackingItem(req: Request, res: Response, next: NextFunction) {
  try {
    await packingService.deletePackingItem(p(req, 'id'), req.user!.id, p(req, 'itemId'));
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function bulkTogglePacked(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids, isPacked } = req.body as { ids: string[]; isPacked: boolean };
    const result = await packingService.bulkTogglePacked(p(req, 'id'), req.user!.id, ids, isPacked);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function deleteAllPacked(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await packingService.deleteAllPacked(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getPackingProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const progress = await packingService.getPackingProgress(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: progress });
  } catch (err) { next(err); }
}

export async function bulkCreateItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await packingService.bulkCreateItems(p(req, 'id'), req.user!.id, req.body.items || []);
    res.status(201).json({ success: true, data: items });
  } catch (err) { next(err); }
}
