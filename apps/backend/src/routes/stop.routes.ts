import { Router } from 'express';
import * as stopController from '../controllers/stop.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createStopSchema, updateStopSchema, reorderStopsSchema } from '../schemas/stop.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', stopController.listStops);
router.post('/', validate(createStopSchema), stopController.createStop);
router.patch('/reorder', validate(reorderStopsSchema), stopController.reorderStops);
router.patch('/:stopId', validate(updateStopSchema), stopController.updateStop);
router.delete('/:stopId', stopController.deleteStop);

export default router;
