import { Request, Response, NextFunction } from 'express';
import * as cityService from '../services/city.service';
import { p } from '../utils/params';

export async function searchCities(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, region, sort, page, limit } = req.query as any;
    const result = await cityService.searchCities(q, region, sort, Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await cityService.getCityById(p(req, 'id'));
    res.json({ success: true, data: city });
  } catch (err) { next(err); }
}

export async function getCityActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, max_cost } = req.query as any;
    const activities = await cityService.getCityActivities(p(req, 'id'), type, max_cost ? Number(max_cost) : undefined);
    res.json({ success: true, data: activities });
  } catch (err) { next(err); }
}
