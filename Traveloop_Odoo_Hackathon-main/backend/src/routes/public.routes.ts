import { Router } from 'express';
import * as publicController from '../controllers/public.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/:token', publicController.getPublicTrip);
router.post('/:token/copy', authenticate, publicController.copyPublicTrip);

export default router;
