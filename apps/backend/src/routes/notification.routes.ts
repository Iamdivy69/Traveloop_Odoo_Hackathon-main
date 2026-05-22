import { Router } from 'express';
import * as notifController from '../controllers/notification.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', notifController.listNotifications);
router.get('/unread-count', notifController.getUnreadCount);
router.patch('/read-all', notifController.markAllAsRead);
router.patch('/:id/read', notifController.markAsRead);
router.delete('/:id', notifController.deleteNotification);

export default router;
