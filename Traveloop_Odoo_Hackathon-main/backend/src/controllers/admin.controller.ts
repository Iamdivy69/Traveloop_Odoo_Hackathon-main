import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as any;
    const result = await adminService.listUsers(Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function listAllTrips(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as any;
    const result = await adminService.listAllTrips(Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
