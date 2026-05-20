import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

// Apply auth and admin-only checks to all routes
router.use(authenticate);
router.use(adminOnly);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/cities', adminController.createCity);
router.post('/cities/:id/activities', adminController.addActivityToCity);
router.delete('/users/:id', adminController.deleteUser);

export default router;
