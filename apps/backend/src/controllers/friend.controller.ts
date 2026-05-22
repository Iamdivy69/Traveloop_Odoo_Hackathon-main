import { Request, Response, NextFunction } from 'express';
import * as friendService from '../services/friend.service';
import { p } from '../utils/params';

export async function sendRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await friendService.sendFriendRequest(req.user!.id, req.body.userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function acceptRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await friendService.acceptFriendRequest(p(req, 'requestId'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function declineRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await friendService.declineFriendRequest(p(req, 'requestId'), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function unfriend(req: Request, res: Response, next: NextFunction) {
  try {
    await friendService.unfriend(p(req, 'friendId'), req.user!.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function getMyFriends(req: Request, res: Response, next: NextFunction) {
  try {
    const friends = await friendService.getMyFriends(req.user!.id);
    res.json({ success: true, data: friends });
  } catch (err) { next(err); }
}

export async function getIncomingRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const requests = await friendService.getIncomingRequests(req.user!.id);
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
}

export async function getFriendStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const status = await friendService.getFriendshipStatus(req.user!.id, p(req, 'userId'));
    res.json({ success: true, data: status });
  } catch (err) { next(err); }
}
