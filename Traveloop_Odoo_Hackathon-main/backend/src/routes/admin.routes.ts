import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.get('/trips', adminController.listAllTrips);

export default router;
