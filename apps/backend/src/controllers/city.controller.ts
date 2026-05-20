import { Request, Response, NextFunction } from 'express';
import * as cityService from '../services/city.service';
import { p } from '../utils/params';

export async function searchCities(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, country, limit, offset } = req.query as any;
    const result = await cityService.searchCities(
      q, 
      country, 
      limit ? Number(limit) : 20, 
      offset ? Number(offset) : 0
    );
    res.json({ success: true, data: result });
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
    const { type, min_cost, max_cost, limit, offset } = req.query as any;
    const result = await cityService.getCityActivities(
      p(req, 'id'), 
      type, 
      min_cost !== undefined ? Number(min_cost) : undefined,
      max_cost !== undefined ? Number(max_cost) : undefined,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
