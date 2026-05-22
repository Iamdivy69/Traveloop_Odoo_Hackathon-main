import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useDeleteExpense } from '../../hooks/useExpenses';

interface ExpenseCardProps {
  expense: any;
  currency: string;
  tripId: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  FOOD: '🍔',
  TRANSPORT: '✈️',
  ACCOMMODATION: '🏨',
  ACTIVITY: '🎟️',
  SHOPPING: '🛍️',
  OTHER: '💸',
};

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: 'bg-[#10b981]/10 text-[#10b981]',
  TRANSPORT: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  ACCOMMODATION: 'bg-[#3b82f6]/10 text-[#3b82f6]',
  ACTIVITY: 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
  SHOPPING: 'bg-[#ec4899]/10 text-[#ec4899]',
  OTHER: 'bg-[#64748B]/10 text-[#64748B]',
};

export default function ExpenseCard({ expense, currency, tripId }: ExpenseCardProps) {
  const deleteExpense = useDeleteExpense(tripId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const payerName = expense.paid_by?.first_name 
    ? `${expense.paid_by.first_name} ${expense.paid_by.last_name || ''}`
    : 'Unknown';

  const initial = payerName.charAt(0);

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#E8604C]/40 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER}`}>
          {CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.OTHER}
        </div>
        <div>
          <h4 className="font-bold text-[#0b1c30] group-hover:text-[#E8604C] transition-colors">{expense.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 font-medium">
              {format(new Date(expense.created_at), 'MMM d, yyyy')}
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              {expense.paid_by?.photo_url ? (
                <img src={expense.paid_by.photo_url} alt={payerName} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                  {initial}
                </div>
              )}
              <span className="text-xs text-slate-500">Paid by {payerName}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-black text-[#0b1c30] text-lg">{formatCurrency(Number(expense.amount))}</p>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER}`}>
            {expense.category}
          </span>
        </div>
        <button
          onClick={() => deleteExpense.mutate(expense.id)}
          disabled={deleteExpense.isPending}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
          title="Delete Expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
