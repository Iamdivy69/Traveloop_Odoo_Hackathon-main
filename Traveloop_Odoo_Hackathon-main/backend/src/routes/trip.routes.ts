import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createTripSchema, updateTripSchema, shareTripSchema } from '../schemas/trip.schema';

const router = Router();

router.use(authenticate);

router.get('/', tripController.listTrips);
router.post('/', validate(createTripSchema), tripController.createTrip);
router.get('/:id', tripController.getTrip);
router.patch('/:id', validate(updateTripSchema), tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.patch('/:id/share', validate(shareTripSchema), tripController.toggleShare);
router.get('/:id/budget', tripController.getBudget);

export default router;
