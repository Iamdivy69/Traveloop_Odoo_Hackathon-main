import { Router } from 'express';
import * as cityController from '../controllers/city.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', cityController.searchCities);
router.get('/:id', cityController.getCity);
router.get('/:id/activities', cityController.getCityActivities);

export default router;
