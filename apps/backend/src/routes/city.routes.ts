import { Router } from 'express';
import * as cityController from '../controllers/city.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/adminOnly';
import { validate, validateQuery } from '../middleware/validate';
import {
  cityListQuerySchema,
  createCitySchema,
  updateCitySchema,
  createActivitySchema,
  updateActivitySchema,
  activityFilterSchema,
} from '../schemas/city.schema';

const router = Router();

// ─── Public routes (no auth required) ───────────────────────────
router.get('/', validateQuery(cityListQuerySchema), cityController.searchCities);
router.get('/:id', cityController.getCity);
router.get('/:id/activities', validateQuery(activityFilterSchema), cityController.getCityActivities);

// ─── Admin routes ────────────────────────────────────────────────
router.post('/', authenticate, adminOnly, validate(createCitySchema), cityController.adminCreateCity);
router.put('/:id', authenticate, adminOnly, validate(updateCitySchema), cityController.adminUpdateCity);
router.delete('/:id', authenticate, adminOnly, cityController.adminDeleteCity);
router.post('/:id/activities', authenticate, adminOnly, validate(createActivitySchema), cityController.adminAddActivity);

export default router;
