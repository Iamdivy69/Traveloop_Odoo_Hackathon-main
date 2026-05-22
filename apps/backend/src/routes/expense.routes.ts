import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);
router.get('/summary', expenseController.getSummary);
router.put('/:expenseId', expenseController.updateExpense);
router.delete('/:expenseId', expenseController.deleteExpense);

router.post('/:expenseId/split', expenseController.splitExpense);
router.put('/splits/:splitId/pay', expenseController.paySplit);

export default router;
