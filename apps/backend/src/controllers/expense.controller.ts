import type { Request, Response, NextFunction } from 'express';
import * as expenseService from '../services/expense.service';
import { createExpenseSchema, updateExpenseSchema, splitExpenseSchema } from '../schemas/expense.schema';

export async function getExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const expenses = await expenseService.getExpenses(tripId);
    res.json({ success: true, data: expenses });
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const userId = req.user!.id;
    const parsed = createExpenseSchema.parse(req.body);
    const expense = await expenseService.createExpense(tripId, userId, parsed);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
}

export async function updateExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const expenseId = req.params.expenseId as string;
    const parsed = updateExpenseSchema.parse(req.body);
    const expense = await expenseService.updateExpense(expenseId, tripId, parsed);
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const expenseId = req.params.expenseId as string;
    const userId = req.user!.id;
    const isAdmin = req.user!.is_admin;
    await expenseService.deleteExpense(expenseId, tripId, userId, isAdmin);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const summary = await expenseService.getSummary(tripId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function splitExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const expenseId = req.params.expenseId as string;
    const parsed = splitExpenseSchema.parse(req.body);
    const expense = await expenseService.splitExpense(expenseId, tripId, parsed.splits);
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
}

export async function paySplit(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const splitId = req.params.splitId as string;
    const userId = req.user!.id;
    const split = await expenseService.paySplit(splitId, tripId, userId);
    res.json({ success: true, data: split });
  } catch (err) {
    next(err);
  }
}
