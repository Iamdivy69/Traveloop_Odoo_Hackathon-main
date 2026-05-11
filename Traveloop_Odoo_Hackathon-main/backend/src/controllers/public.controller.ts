import { Request, Response, NextFunction } from 'express';
import * as publicService from '../services/public.service';
import { p } from '../utils/params';

export async function getPublicTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await publicService.getPublicTrip(p(req, 'token'));
    res.json({ success: true, data: trip });
  } catch (err) { next(err); }
}

export async function copyPublicTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await publicService.copyPublicTrip(p(req, 'token'), req.user!.sub);
    res.status(201).json({ success: true, data: trip });
  } catch (err) { next(err); }
}
