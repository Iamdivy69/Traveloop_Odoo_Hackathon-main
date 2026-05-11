import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.user!.sub);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.user!.sub, req.body);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.changePassword(req.user!.sub, req.body.current_password, req.body.new_password);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.deleteAccount(req.user!.sub);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
