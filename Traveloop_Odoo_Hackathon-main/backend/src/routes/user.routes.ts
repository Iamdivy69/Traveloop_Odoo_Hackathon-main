import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../schemas/user.schema';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.delete('/me', userController.deleteAccount);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);

export default router;
