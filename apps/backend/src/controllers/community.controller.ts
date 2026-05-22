import { Request, Response, NextFunction } from 'express';
import * as communityService from '../services/community.service';
import { p } from '../utils/params';
import type { FeedQuery } from '../schemas/community.schema';

export async function getFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as unknown as FeedQuery;
    const result = await communityService.getFeed(req.user!.id, q.page, q.limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await communityService.getPost(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await communityService.createPost(req.user!.id, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await communityService.updatePost(p(req, 'id'), req.user!.id, req.body);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await communityService.deletePost(p(req, 'id'), req.user!.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function toggleLike(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await communityService.toggleLike(p(req, 'id'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function discoverUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await communityService.discoverUsers(req.user!.id);
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}
