import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useCreateExpense } from '../../hooks/useExpenses';
import { useAuthStore } from '../../store/authStore';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  currency?: string;
}

export default function AddExpenseModal({ open, onClose, tripId, currency = 'INR' }: AddExpenseModalProps) {
  const { user } = useAuthStore();
  const createExpense = useCreateExpense(tripId);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('ACTIVITY');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      await createExpense.mutateAsync({
        title,
        amount: Number(amount),
        currency,
        category,
        // Omit splits for simplicity in this basic version
      });
      setTitle('');
      setAmount('');
      setCategory('ACTIVITY');
      onClose();
    } catch (err) {
      console.error('Failed to create expense', err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-[#0b1c30] font-heading">Add Expense</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Dinner at Colosseum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-field w-full text-sm py-2.5 px-3 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm font-medium">
                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="input-field w-full pl-8 text-sm py-2.5 px-3 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field w-full text-sm py-2.5 px-3 bg-white"
                  >
                    <option value="ACCOMMODATION">Accommodation</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="FOOD">Food & Dining</option>
                    <option value="ACTIVITY">Activity</option>
                    <option value="SHOPPING">Shopping</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Paid By</label>
                <input
                  type="text"
                  disabled
                  value={`${user?.first_name} ${user?.last_name} (You)`}
                  className="input-field w-full text-sm py-2.5 px-3 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-[#64748B] hover:text-[#0b1c30] hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExpense.isPending || !title || !amount}
                  className="btn-primary py-2.5 px-6"
                >
                  {createExpense.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Add Expense'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
