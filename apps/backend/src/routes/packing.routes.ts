import { Router } from 'express';
import * as packingController from '../controllers/packing.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createPackingSchema, updatePackingSchema } from '../schemas/packing.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Progress & special actions FIRST (before /:itemId to avoid conflicts)
router.get('/progress', packingController.getPackingProgress);
router.put('/bulk-check', packingController.bulkTogglePacked);
router.delete('/packed', packingController.deleteAllPacked);

// CRUD
router.get('/', packingController.getPackingItems);
router.post('/', validate(createPackingSchema), packingController.addPackingItem);
router.post('/bulk', packingController.bulkCreateItems);
router.put('/:itemId', validate(updatePackingSchema), packingController.updatePackingItem);
router.delete('/:itemId', packingController.deletePackingItem);

export default router;
