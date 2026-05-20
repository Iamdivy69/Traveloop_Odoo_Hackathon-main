import { Router } from 'express';
import * as noteController from '../controllers/note.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', noteController.getNotes);
router.post('/', noteController.createNote);
router.get('/:noteId', noteController.getNote);
router.patch('/:noteId', noteController.updateNote);
router.delete('/:noteId', noteController.deleteNote);

export default router;
