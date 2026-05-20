import { Request, Response, NextFunction } from 'express';
import * as stopService from '../services/stop.service';
import { p } from '../utils/params';

export async function listStops(req: Request, res: Response, next: NextFunction) {
  try {
    const stops = await stopService.listStops(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: stops });
  } catch (err) { next(err); }
}

export async function createStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = await stopService.createStop(p(req, 'id'), req.user!.id, req.body);
    res.status(201).json({ success: true, data: stop });
  } catch (err) { next(err); }
}

export async function updateStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = await stopService.updateStop(p(req, 'id'), p(req, 'stopId'), req.user!.id, req.body);
    res.json({ success: true, data: stop });
  } catch (err) { next(err); }
}

export async function deleteStop(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await stopService.deleteStop(p(req, 'id'), p(req, 'stopId'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function reorderStops(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await stopService.reorderStops(p(req, 'id'), req.user!.id, req.body.order);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
