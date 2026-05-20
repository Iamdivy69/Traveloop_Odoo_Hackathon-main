import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authenticate } from '../middleware/authenticate';
import { validate, validateQuery } from '../middleware/validate';
import { createTripSchema, updateTripSchema, tripListQuerySchema } from '../schemas/trip.schema';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(tripListQuerySchema), tripController.listTrips);
router.post('/', validate(createTripSchema), tripController.createTrip);
router.get('/:id/budget', tripController.getBudget);
router.post('/:id/share', tripController.toggleShare);
router.get('/:id', tripController.getTrip);
router.patch('/:id', validate(updateTripSchema), tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

export default router;
