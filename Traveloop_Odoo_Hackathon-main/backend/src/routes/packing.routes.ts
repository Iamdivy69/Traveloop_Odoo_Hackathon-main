import { Router } from 'express';
import * as packingController from '../controllers/packing.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createPackingSchema, updatePackingSchema } from '../schemas/packing.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', packingController.listPackingItems);
router.post('/', validate(createPackingSchema), packingController.createPackingItem);
router.delete('/reset', packingController.resetChecklist);
router.patch('/:itemId', validate(updatePackingSchema), packingController.updatePackingItem);
router.delete('/:itemId', packingController.deletePackingItem);

export default router;
