import { Router } from 'express';
import * as friendController from '../controllers/friend.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { friendRequestSchema } from '../schemas/community.schema';

const router = Router();

router.use(authenticate);

router.get('/', friendController.getMyFriends);
router.get('/requests', friendController.getIncomingRequests);
router.get('/status/:userId', friendController.getFriendStatus);
router.post('/request', validate(friendRequestSchema), friendController.sendRequest);
router.put('/:requestId/accept', friendController.acceptRequest);
router.put('/:requestId/decline', friendController.declineRequest);
router.delete('/:friendId', friendController.unfriend);

export default router;
