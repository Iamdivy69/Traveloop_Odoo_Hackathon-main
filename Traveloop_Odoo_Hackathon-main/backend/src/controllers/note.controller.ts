import { Request, Response, NextFunction } from 'express';
import * as noteService from '../services/note.service';
import { p } from '../utils/params';

export async function listNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const notes = await noteService.listNotes(p(req, 'id'), req.user!.sub, req.query.stop_id as string | undefined);
    res.json({ success: true, data: notes });
  } catch (err) { next(err); }
}

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await noteService.createNote(p(req, 'id'), req.user!.sub, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (err) { next(err); }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await noteService.updateNote(p(req, 'id'), p(req, 'noteId'), req.user!.sub, req.body);
    res.json({ success: true, data: note });
  } catch (err) { next(err); }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await noteService.deleteNote(p(req, 'id'), p(req, 'noteId'), req.user!.sub);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
