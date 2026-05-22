import { Request, Response, NextFunction } from 'express';
import * as tripService from '../services/trip.service';
import { p } from '../utils/params';
import type { TripListQuery } from '../schemas/trip.schema';

export async function listTrips(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as unknown as TripListQuery;
    const result = await tripService.listTrips(req.user!.id, q);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function createTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.createTrip(req.user!.id, req.body);
    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function getTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.getTrip(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function updateTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.updateTrip(p(req, 'id'), req.user!.id, req.body);
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(req: Request, res: Response, next: NextFunction) {
  try {
    await tripService.deleteTrip(p(req, 'id'), req.user!.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function toggleShare(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tripService.toggleShare(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const budget = await tripService.calculateBudget(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
}

export async function getTripStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await tripService.getTripStats(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
