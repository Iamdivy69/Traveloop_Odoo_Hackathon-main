import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import { p } from '../utils/params';
import { notificationQuerySchema } from '../schemas/notification.schema';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const query = notificationQuerySchema.parse(req.query);
    const result = await notificationService.listNotifications(
      req.user!.id,
      query.page,
      query.limit
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notif = await notificationService.markAsRead(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: notif });
  } catch (err) { next(err); }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.deleteNotification(p(req, 'id'), req.user!.id);
    res.status(204).end();
  } catch (err) { next(err); }
}
