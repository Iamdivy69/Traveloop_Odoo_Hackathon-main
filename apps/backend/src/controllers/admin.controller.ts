import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { p } from '../utils/params';

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search } = req.query as any;
    const users = await adminService.getUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search ? String(search) : ''
    );
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

export async function createCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await adminService.createCity(req.body);
    res.status(201).json({ success: true, data: city });
  } catch (err) { next(err); }
}

export async function addActivityToCity(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await adminService.addActivityToCity(p(req, 'id'), req.body);
    res.status(201).json({ success: true, data: activity });
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deleteUser(p(req, 'id'), req.user!.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function toggleAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.toggleAdmin(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function suspendUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = req.body;
    const result = await adminService.suspendUser(p(req, 'id'), req.user!.id, reason);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function restoreUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.restoreUser(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as any;
    const result = await adminService.getPosts(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deletePost(p(req, 'id'));
    res.status(204).end();
  } catch (err) { next(err); }
}
