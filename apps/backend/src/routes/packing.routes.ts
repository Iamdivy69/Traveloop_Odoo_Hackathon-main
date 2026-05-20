import { Router } from 'express';
import * as packingController from '../controllers/packing.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', packingController.getPackingItems);
router.post('/', packingController.addPackingItem);
router.post('/bulk', packingController.bulkCreateItems);
router.patch('/:itemId', packingController.updatePackingItem);
router.delete('/:itemId', packingController.deletePackingItem);

export default router;
