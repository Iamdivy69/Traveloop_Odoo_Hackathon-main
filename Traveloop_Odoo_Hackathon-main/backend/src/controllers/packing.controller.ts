import { Request, Response, NextFunction } from 'express';
import * as packingService from '../services/packing.service';
import { p } from '../utils/params';

export async function listPackingItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await packingService.listPackingItems(p(req, 'id'), req.user!.sub);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

export async function createPackingItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await packingService.createPackingItem(p(req, 'id'), req.user!.sub, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function updatePackingItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await packingService.updatePackingItem(p(req, 'id'), p(req, 'itemId'), req.user!.sub, req.body);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function deletePackingItem(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await packingService.deletePackingItem(p(req, 'id'), p(req, 'itemId'), req.user!.sub);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function resetChecklist(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await packingService.resetChecklist(p(req, 'id'), req.user!.sub);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
