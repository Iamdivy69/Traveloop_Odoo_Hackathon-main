import { Router } from 'express';
import * as cityController from '../controllers/city.controller';

const router = Router();

router.get('/', cityController.searchCities);
router.get('/:id', cityController.getCity);
router.get('/:id/activities', cityController.getCityActivities);

export default router;
