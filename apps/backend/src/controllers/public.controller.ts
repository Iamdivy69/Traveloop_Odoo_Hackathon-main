import { Request, Response, NextFunction } from 'express';
import * as publicService from '../services/public.service';
import { p } from '../utils/params';

export async function getSharedTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await publicService.getSharedTrip(p(req, 'token'));
    res.json({ success: true, data: trip });
  } catch (err) { next(err); }
}

export async function copySharedTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await publicService.copySharedTrip(p(req, 'token'), req.user!.id);
    res.status(201).json({ success: true, data: trip });
  } catch (err) { next(err); }
}
