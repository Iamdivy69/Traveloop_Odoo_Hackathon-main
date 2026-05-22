import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { p } from '../utils/params';


export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await userService.getStats(req.user!.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.changePassword(
      req.user!.id,
      req.body.current_password,
      req.body.new_password
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.deleteAccount(req.user!.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function checkUsername(req: Request, res: Response, next: NextFunction) {
  try {
    const username = String(req.query.username || '');
    const result = await userService.checkUsername(username);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateUsername(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUsername(req.user!.id, req.body.username);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getPublicProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const username = p(req, 'username');
    const profile = await userService.getPublicProfile(username);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

