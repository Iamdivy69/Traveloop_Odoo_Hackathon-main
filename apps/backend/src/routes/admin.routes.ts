import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as cityController from '../controllers/city.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/adminOnly';
import { validate } from '../middleware/validate';
import { updateActivitySchema } from '../schemas/city.schema';

const router = Router();

// Apply auth and admin-only checks to all routes
router.use(authenticate);
router.use(adminOnly);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/toggle-admin', adminController.toggleAdmin);
router.put('/users/:id/suspend', adminController.suspendUser);
router.put('/users/:id/restore', adminController.restoreUser);

// Community moderation routes
router.get('/posts', adminController.getPosts);
router.delete('/posts/:id', adminController.deletePost);

// Activity management (standalone routes: /admin/activities/:id)
router.put('/activities/:id', validate(updateActivitySchema), cityController.adminUpdateActivity);
router.delete('/activities/:id', cityController.adminDeleteActivity);

export default router;
