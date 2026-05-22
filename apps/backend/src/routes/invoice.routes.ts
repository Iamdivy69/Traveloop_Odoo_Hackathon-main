import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', invoiceController.getInvoice);

export default router;
