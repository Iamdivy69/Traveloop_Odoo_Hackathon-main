import { Router } from 'express';
import * as noteController from '../controllers/note.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createNoteSchema, updateNoteSchema } from '../schemas/note.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', noteController.listNotes);
router.post('/', validate(createNoteSchema), noteController.createNote);
router.patch('/:noteId', validate(updateNoteSchema), noteController.updateNote);
router.delete('/:noteId', noteController.deleteNote);

export default router;
