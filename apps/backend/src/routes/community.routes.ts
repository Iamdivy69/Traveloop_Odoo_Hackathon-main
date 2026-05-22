import { Router } from 'express';
import * as communityController from '../controllers/community.controller';
import { authenticate } from '../middleware/authenticate';
import { validate, validateQuery } from '../middleware/validate';
import { createPostSchema, updatePostSchema, feedQuerySchema } from '../schemas/community.schema';

const router = Router();

// All community routes require auth
router.use(authenticate);

router.get('/feed', validateQuery(feedQuerySchema), communityController.getFeed);
router.get('/users', communityController.discoverUsers);
router.get('/posts/:id', communityController.getPost);
router.post('/posts', validate(createPostSchema), communityController.createPost);
router.put('/posts/:id', validate(updatePostSchema), communityController.updatePost);
router.delete('/posts/:id', communityController.deletePost);
router.post('/posts/:id/like', communityController.toggleLike);

export default router;
