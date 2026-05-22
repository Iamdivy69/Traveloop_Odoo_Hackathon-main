import type { Request, Response, NextFunction } from 'express';
import * as invoiceService from '../services/invoice.service';

export async function getInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = req.params.id as string;
    const invoice = await invoiceService.generateInvoice(tripId);
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}
