import { Request, Response, NextFunction } from 'express';
import * as noteService from '../services/note.service';
import { p } from '../utils/params';

export async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const { stop_id } = req.query as { stop_id?: string };
    const notes = await noteService.getNotes(p(req, 'id'), req.user!.id, stop_id);
    res.json({ success: true, data: notes });
  } catch (err) { next(err); }
}

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { content, stop_id } = req.body;
    const note = await noteService.createNote(p(req, 'id'), req.user!.id, content, stop_id);
    res.status(201).json({ success: true, data: note });
  } catch (err) { next(err); }
}

export async function getNote(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await noteService.getNote(p(req, 'id'), req.user!.id, p(req, 'noteId'));
    res.json({ success: true, data: note });
  } catch (err) { next(err); }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { content } = req.body;
    const note = await noteService.updateNote(p(req, 'id'), req.user!.id, p(req, 'noteId'), content);
    res.json({ success: true, data: note });
  } catch (err) { next(err); }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    await noteService.deleteNote(p(req, 'id'), req.user!.id, p(req, 'noteId'));
    res.status(204).end();
  } catch (err) { next(err); }
}
