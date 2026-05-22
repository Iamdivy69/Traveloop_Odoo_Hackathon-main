import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validate, validateQuery } from '../middleware/validate';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateUsernameSchema,
  checkUsernameQuerySchema,
} from '../schemas/user.schema';

const router = Router();

// Public routes (No authentication required)
router.get('/check-username', validateQuery(checkUsernameQuerySchema), userController.checkUsername);
router.get('/:username', (req, res, next) => {
  if (req.params.username === 'me') {
    return next();
  }
  return userController.getPublicProfile(req, res, next);
});

// Authenticated routes
router.use(authenticate);

router.get('/me/stats', userController.getStats);
router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.put('/me', validate(updateProfileSchema), userController.updateProfile);
router.put('/me/username', validate(updateUsernameSchema), userController.updateUsername);
router.delete('/me', userController.deleteAccount);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);

export default router;
