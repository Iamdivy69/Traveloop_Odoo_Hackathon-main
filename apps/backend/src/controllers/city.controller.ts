import { Request, Response, NextFunction } from 'express';
import * as cityService from '../services/city.service';
import { p } from '../utils/params';
import type { CityListQuery, ActivityFilterQuery } from '../schemas/city.schema';

// ─── Public ──────────────────────────────────────────────────────
export async function searchCities(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as unknown as CityListQuery;
    const result = await cityService.listCities(q);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await cityService.getCityWithActivities(p(req, 'id'));
    res.json({ success: true, data: city });
  } catch (err) { next(err); }
}

export async function getCityActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as unknown as ActivityFilterQuery;
    const result = await cityService.getCityActivities(p(req, 'id'), {
      category: q.category,
      max_cost: q.max_cost,
      search: q.search,
      limit: q.limit,
      offset: q.offset,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// ─── Admin ───────────────────────────────────────────────────────
export async function adminCreateCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await cityService.createCity(req.body);
    res.status(201).json({ success: true, data: city });
  } catch (err) { next(err); }
}

export async function adminUpdateCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await cityService.updateCity(p(req, 'id'), req.body);
    res.json({ success: true, data: city });
  } catch (err) { next(err); }
}

export async function adminDeleteCity(req: Request, res: Response, next: NextFunction) {
  try {
    await cityService.deleteCity(p(req, 'id'));
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function adminAddActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await cityService.addActivityToCity(p(req, 'id'), req.body);
    res.status(201).json({ success: true, data: activity });
  } catch (err) { next(err); }
}

export async function adminUpdateActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await cityService.updateActivity(p(req, 'id'), req.body);
    res.json({ success: true, data: activity });
  } catch (err) { next(err); }
}

export async function adminDeleteActivity(req: Request, res: Response, next: NextFunction) {
  try {
    await cityService.deleteActivity(p(req, 'id'));
    res.status(204).end();
  } catch (err) { next(err); }
}
