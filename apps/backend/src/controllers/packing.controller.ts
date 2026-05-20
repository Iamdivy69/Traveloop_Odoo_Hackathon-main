import { Request, Response, NextFunction } from 'express';
import * as packingService from '../services/packing.service';
import { p } from '../utils/params';

export async function getPackingItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await packingService.getPackingItems(p(req, 'id'), req.user!.id);
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

export async function bulkCreateItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await packingService.bulkCreateItems(p(req, 'id'), req.user!.id, req.body.items || []);
    res.status(201).json({ success: true, data: items });
  } catch (err) { next(err); }
}
