import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateExpenseInput, UpdateExpenseInput } from '../schemas/expense.schema';

export async function getExpenses(tripId: string) {
  return await prisma.expense.findMany({
    where: { trip_id: tripId },
    include: {
      paid_by: {
        select: { id: true, first_name: true, last_name: true, photo_url: true },
      },
      splits: {
        include: {
          user: {
            select: { id: true, first_name: true, last_name: true, photo_url: true },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function createExpense(
  tripId: string,
  paidById: string,
  data: CreateExpenseInput
) {
  // Enforce single-currency per trip
  const mismatchedExpense = await prisma.expense.findFirst({
    where: {
      trip_id: tripId,
      currency: { not: data.currency },
    },
    select: { currency: true },
  });
  if (mismatchedExpense) {
    throw new AppError(400, 'CURRENCY_MISMATCH', 'All trip expenses must use the same currency');
  }

  // Validate splits if provided
  if (data.splits && data.splits.length > 0) {
    const totalSplitsCents = data.splits.reduce((sum, split) => sum + Math.round(split.amount * 100), 0);
    const amountCents = Math.round(data.amount * 100);
    if (Math.abs(totalSplitsCents - amountCents) > 1) {
      throw new AppError(400, 'BAD_REQUEST', 'Sum of splits must equal the total amount');
    }
  }

  return await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        trip_id: tripId,
        title: data.title,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        paid_by_id: paidById,
      },
    });

    if (data.splits && data.splits.length > 0) {
      const splitsData = data.splits.map((s) => ({
        expense_id: expense.id,
        user_id: s.userId,
        amount: s.amount,
        is_paid: s.userId === paidById, // auto-paid if the person splitting is the one who paid
      }));

      await tx.expenseSplit.createMany({
        data: splitsData,
      });
    }

    return await tx.expense.findUnique({
      where: { id: expense.id },
      include: { splits: true, paid_by: true },
    });
  });
}

export async function updateExpense(
  id: string,
  tripId: string,
  data: UpdateExpenseInput
) {
  const expense = await prisma.expense.findFirst({
    where: { id, trip_id: tripId },
  });

  if (!expense) throw new AppError(404, 'NOT_FOUND', 'Expense not found');

  if (data.currency) {
    const mismatchedExpense = await prisma.expense.findFirst({
      where: {
        trip_id: tripId,
        id: { not: id },
        currency: { not: data.currency },
      },
      select: { currency: true },
    });
    if (mismatchedExpense) {
      throw new AppError(400, 'CURRENCY_MISMATCH', 'All trip expenses must use the same currency');
    }
  }

  return await prisma.expense.update({
    where: { id },
    data: {
      title: data.title,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
    },
    include: {
      splits: true,
      paid_by: true,
    },
  });
}

export async function deleteExpense(id: string, tripId: string, userId: string, isAdmin: boolean) {
  const expense = await prisma.expense.findFirst({
    where: { id, trip_id: tripId },
  });

  if (!expense) throw new AppError(404, 'NOT_FOUND', 'Expense not found');

  if (!isAdmin && expense.paid_by_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only delete your own expenses');
  }

  await prisma.expense.delete({
    where: { id },
  });
}

export async function getSummary(tripId: string) {
  const expenses = await prisma.expense.findMany({
    where: { trip_id: tripId },
    include: {
      splits: true,
      paid_by: true,
    },
  });

  let totalSpentCents = 0;
  const categoryMap: Record<string, { totalCents: number; count: number }> = {};
  const personMap: Record<string, { name: string; paidCents: number; owesCents: number }> = {};

  for (const exp of expenses) {
    const amtCents = Math.round(Number(exp.amount) * 100);
    totalSpentCents += amtCents;

    // By Category
    if (!categoryMap[exp.category]) {
      categoryMap[exp.category] = { totalCents: 0, count: 0 };
    }
    categoryMap[exp.category].totalCents += amtCents;
    categoryMap[exp.category].count += 1;

    // By Person (Paid)
    const payerId = exp.paid_by_id;
    const payerName = `${exp.paid_by.first_name} ${exp.paid_by.last_name}`;
    if (!personMap[payerId]) {
      personMap[payerId] = { name: payerName, paidCents: 0, owesCents: 0 };
    }
    personMap[payerId].paidCents += amtCents;

    // By Person (Splits)
    if (exp.splits && exp.splits.length > 0) {
      for (const split of exp.splits) {
        if (!personMap[split.user_id]) {
          personMap[split.user_id] = { name: 'User ' + split.user_id.substring(0,4), paidCents: 0, owesCents: 0 };
        }
        personMap[split.user_id].owesCents += Math.round(Number(split.amount) * 100);
      }
    } else {
      // If no splits, assume payer owes it all to themselves (no net effect)
      personMap[payerId].owesCents += amtCents;
    }
  }

  // Refine user names for those who only owe and haven't paid anything
  // We can fetch user details for anyone missing a real name
  const missingNameIds = Object.keys(personMap).filter((id) => personMap[id].name.startsWith('User '));
  if (missingNameIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: missingNameIds } },
    });
    for (const u of users) {
      if (personMap[u.id]) {
        personMap[u.id].name = `${u.first_name} ${u.last_name}`;
      }
    }
  }

  const byCategory = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    total: categoryMap[cat].totalCents / 100,
    count: categoryMap[cat].count,
  }));

  const byPerson = Object.keys(personMap).map((id) => ({
    id,
    name: personMap[id].name,
    paid: personMap[id].paidCents / 100,
    owes: personMap[id].owesCents / 100,
    balance: (personMap[id].paidCents - personMap[id].owesCents) / 100,
  }));

  return {
    totalSpent: totalSpentCents / 100,
    byCategory,
    byPerson,
  };
}

export async function splitExpense(expenseId: string, tripId: string, splits: { userId: string; amount: number }[]) {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, trip_id: tripId },
  });

  if (!expense) throw new AppError(404, 'NOT_FOUND', 'Expense not found');

  const totalSplitsCents = splits.reduce((sum, split) => sum + Math.round(split.amount * 100), 0);
  const amountCents = Math.round(Number(expense.amount) * 100);
  if (Math.abs(totalSplitsCents - amountCents) > 1) {
    throw new AppError(400, 'BAD_REQUEST', 'Sum of splits must equal the total amount');
  }

  return await prisma.$transaction(async (tx) => {
    // Delete existing splits
    await tx.expenseSplit.deleteMany({
      where: { expense_id: expenseId },
    });

    const splitsData = splits.map((s) => ({
      expense_id: expenseId,
      user_id: s.userId,
      amount: s.amount,
      is_paid: s.userId === expense.paid_by_id, // automatically paid if they are the payer
    }));

    await tx.expenseSplit.createMany({
      data: splitsData,
    });

    return await tx.expense.findUnique({
      where: { id: expenseId },
      include: { splits: true },
    });
  });
}

export async function paySplit(splitId: string, tripId: string, userId: string) {
  const split = await prisma.expenseSplit.findFirst({
    where: { id: splitId, expense: { trip_id: tripId } },
    include: { expense: true },
  });

  if (!split) throw new AppError(404, 'NOT_FOUND', 'Split not found');

  // Only the person who owes can mark it as paid, or the person who paid it can acknowledge
  if (split.user_id !== userId && split.expense.paid_by_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not authorized to modify this split');
  }

  return await prisma.expenseSplit.update({
    where: { id: splitId },
    data: { is_paid: true },
  });
}
