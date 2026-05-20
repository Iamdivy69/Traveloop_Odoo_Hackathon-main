import { Router } from 'express';
import * as saController from '../controllers/stopActivity.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { addStopActivitySchema, updateStopActivitySchema } from '../schemas/activity.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', saController.listStopActivities);
router.post('/', validate(addStopActivitySchema), saController.addStopActivity);
router.patch('/:saId', validate(updateStopActivitySchema), saController.updateStopActivity);
router.delete('/:saId', saController.deleteStopActivity);

export default router;
