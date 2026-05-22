import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, FileText, Printer, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { useExpenses, useExpenseSummary, useInvoiceData } from '../hooks/useExpenses';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import ExpenseCard from '../components/expenses/ExpenseCard';

export default function ExpenseInvoice() {
  const navigate = useNavigate();
  const { activeTrip } = useStore();
  const { user } = useAuthStore();

  const [view, setView] = useState<'EXPENSE' | 'INVOICE'>('EXPENSE');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Use the ID of the active trip (assumes activeTrip contains the full DB trip id)
  const tripId = activeTrip?.id || '';

  const { data: expenses, isLoading: expensesLoading } = useExpenses(tripId);
  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(tripId);
  const { data: invoice, isLoading: invoiceLoading } = useInvoiceData(tripId);

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!activeTrip) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center mt-20">
        <Receipt className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-h3 font-heading font-bold text-[#0b1c30] mb-2">No Active Trip Found</h2>
        <p className="text-slate-500 mb-6">Select a trip from your dashboard to view expenses.</p>
        <button onClick={() => navigate('/trips')} className="btn-primary mx-auto">
          Back to My Trips
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const totalBudget = activeTrip.budget ? Number(activeTrip.budget) : 0;
  const totalSpent = summary?.totalSpent || 0;
  const remaining = totalBudget - totalSpent;
  const progressPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const currency = 'INR'; // default

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 print:hidden gap-4">
        <div>
          <button
            onClick={() => navigate(`/itinerary/build/${tripId}`)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#0b1c30] text-sm font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Itinerary
          </button>
          <h1 className="text-2xl font-heading font-black text-[#0b1c30]">Finances & Split</h1>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setView('EXPENSE')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${view === 'EXPENSE' ? 'bg-[#E8604C] text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <Wallet className="w-4 h-4" />
            Expenses
          </button>
          <button
            onClick={() => setView('INVOICE')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${view === 'INVOICE' ? 'bg-[#E8604C] text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <FileText className="w-4 h-4" />
            Invoice
          </button>
        </div>
      </div>

      {view === 'EXPENSE' ? (
        <div className="space-y-6 print:hidden">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-[0.03]">
                <Wallet className="w-32 h-32" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
                <h3 className="text-3xl font-black text-[#0b1c30]">{formatCurrency(totalSpent, currency)}</h3>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Out of {formatCurrency(totalBudget, currency)} budget</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Remaining Budget</p>
                <h3 className={`text-3xl font-black ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {formatCurrency(remaining, currency)}
                </h3>
              </div>
              <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressPercent > 90 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Expenses</p>
                <h3 className="text-3xl font-black text-[#0b1c30]">{expenses?.length || 0}</h3>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Transactions recorded</span>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-[#E8604C]/10 text-[#E8604C] flex items-center justify-center hover:bg-[#E8604C] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-[#0b1c30]">Recent Expenses</h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Expense
                </button>
              </div>

              {expensesLoading ? (
                <div className="p-12 text-center text-slate-400">Loading expenses...</div>
              ) : expenses && expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.map((exp: any) => (
                    <ExpenseCard key={exp.id} expense={exp} currency={currency} tripId={tripId} />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                  <Receipt className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium text-[#0b1c30]">No expenses yet</p>
                  <p className="text-xs mt-1">Record your first expense to start tracking your budget.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Category Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-heading font-bold text-[#0b1c30] mb-4">By Category</h3>
                {summaryLoading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : summary?.byCategory?.length > 0 ? (
                  <div className="space-y-4">
                    {summary.byCategory.map((cat: any) => {
                      const percent = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                      return (
                        <div key={cat.category} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-500 uppercase">{cat.category}</span>
                            <span className="font-bold text-[#0b1c30]">{formatCurrency(cat.total, currency)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No data</p>
                )}
              </div>

              {/* Balances */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-heading font-bold text-[#0b1c30] mb-4">Balances</h3>
                {summaryLoading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : summary?.byPerson?.length > 0 ? (
                  <div className="space-y-4">
                    {summary.byPerson.map((person: any) => (
                      <div key={person.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-[#0b1c30]">
                            {person.name} {person.id === user?.id ? '(You)' : ''}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Paid {formatCurrency(person.paid, currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-black ${person.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {person.balance > 0 ? '+' : ''}{formatCurrency(person.balance, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No balances to settle</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-0 md:p-10 rounded-2xl md:border border-slate-200 md:shadow-lg print:border-none print:shadow-none print:p-0">
          <div className="flex justify-end mb-6 print:hidden">
            <button onClick={handlePrint} className="btn-primary py-2 px-6 flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>

          {invoiceLoading ? (
            <div className="p-12 text-center">Loading invoice data...</div>
          ) : invoice ? (
            <div className="invoice-content text-[#0b1c30]">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">INVOICE</h1>
                  <p className="text-slate-500 font-medium">Trip: <strong className="text-[#0b1c30]">{invoice.tripTitle}</strong></p>
                  <p className="text-slate-500 font-medium">Dates: {invoice.dateRange}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold font-heading mb-1 text-[#E8604C]">Traveloop</h2>
                  <p className="text-sm text-slate-500">Generated: {format(new Date(invoice.generatedAt), 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-slate-500">Traveler: {invoice.travelerName}</p>
                </div>
              </div>

              {/* Stops Summary Table */}
              {invoice.stops && invoice.stops.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Itinerary Stops</h3>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-3 px-4 font-bold text-slate-600">Location</th>
                        <th className="py-3 px-4 font-bold text-slate-600">Dates</th>
                        <th className="py-3 px-4 font-bold text-slate-600">Activities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.stops.map((stop: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-3 px-4 font-semibold">{stop.location}</td>
                          <td className="py-3 px-4 text-slate-500">{stop.dates}</td>
                          <td className="py-3 px-4 text-slate-500">
                            {stop.activities.map((a: any) => a.name).join(', ') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Expenses Table */}
              <div className="mb-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Detailed Expenses</h3>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold">Description</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.expenses?.length > 0 ? invoice.expenses.map((exp: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-3 px-4 text-slate-500">{format(new Date(exp.date), 'MMM dd, yyyy')}</td>
                        <td className="py-3 px-4 font-semibold">{exp.title}</td>
                        <td className="py-3 px-4 text-slate-500">{exp.category}</td>
                        <td className="py-3 px-4 font-bold text-right">{formatCurrency(exp.amount, invoice.summary.currency)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">No expenses recorded for this trip.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-500">Subtotal</span>
                    <span className="font-bold text-[#0b1c30]">{formatCurrency(invoice.summary.subtotal, invoice.summary.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-500">Tax</span>
                    <span className="font-bold text-[#0b1c30]">{formatCurrency(0, invoice.summary.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-slate-800">
                    <span className="font-black uppercase tracking-widest">Grand Total</span>
                    <span className="text-2xl font-black text-[#E8604C]">{formatCurrency(invoice.summary.subtotal, invoice.summary.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 text-center text-xs text-slate-400">
                <p>Thank you for using Traveloop to manage your journey.</p>
                <p>This invoice is electronically generated and requires no physical signature.</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-red-500">Failed to load invoice data</div>
          )}
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={tripId}
        currency={currency}
      />
    </div>
  );
}
