import { Request, Response, NextFunction } from 'express';
import * as saService from '../services/stopActivity.service';
import { p } from '../utils/params';

export async function listStopActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const activities = await saService.listStopActivities(p(req, 'id'), p(req, 'stopId'), req.user!.id);
    res.json({ success: true, data: activities });
  } catch (err) { next(err); }
}

export async function addStopActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const sa = await saService.addStopActivity(p(req, 'id'), p(req, 'stopId'), req.user!.id, req.body);
    res.status(201).json({ success: true, data: sa });
  } catch (err) { next(err); }
}

export async function updateStopActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const sa = await saService.updateStopActivity(p(req, 'id'), p(req, 'stopId'), p(req, 'saId'), req.user!.id, req.body);
    res.json({ success: true, data: sa });
  } catch (err) { next(err); }
}

export async function deleteStopActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await saService.deleteStopActivity(p(req, 'id'), p(req, 'stopId'), p(req, 'saId'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
