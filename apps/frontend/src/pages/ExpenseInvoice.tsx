import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, FileText, CheckCircle2, PieChart, CreditCard, Receipt, TrendingUp, Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ExpenseInvoice() {
  const navigate = useNavigate();
  const { activeTrip, updateTrip } = useStore();

  const [currency, setCurrency] = useState('INR');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Activity', description: '', details: '', amount: '' });

  // Exchange rates mock (Base: USD)
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, INR: 83.50 };

  const formatCurrency = (amount: number) => {
    // If currency is INR, we multiply by 83.5 (mock rate) if original was USD
    // Since our store currently stores values in what we assume is USD (based on previous hardcoded values)
    const converted = amount * (rates[currency] || 1);
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  if (!activeTrip) {
    return (
      <div className="page-transition max-w-5xl mx-auto p-6 text-center mt-20 hide-print">
        <Receipt className="w-16 h-16 text-[#e2e8f0] mx-auto mb-4" />
        <h2 className="text-h3 font-heading font-bold text-[#0b1c30] mb-2">No Active Trip Found</h2>
        <p className="text-[#64748B] mb-6">Select a trip from your dashboard to view its financial details.</p>
        <button onClick={() => navigate('/trips')} className="btn-primary mx-auto">
          Back to My Trips
        </button>
      </div>
    );
  }

  const trip = activeTrip;

  // Generate dynamic invoice items from itinerary sections + custom expenses
  const invoiceItems = useMemo(() => {
    const sections = trip.sections.map((section, index) => {
      let category = 'Activity';
      const t = section.title.toLowerCase() + ' ' + section.description.toLowerCase();
      if (t.includes('hotel') || t.includes('stay') || t.includes('resort')) category = 'Accommodation';
      else if (t.includes('flight') || t.includes('train') || t.includes('travel') || t.includes('transport')) category = 'Transport';
      else if (t.includes('food') || t.includes('dinner') || t.includes('tour')) category = 'Food & Tour';

      return {
        id: section.id || String(index),
        sectionId: section.id,
        category,
        description: section.title,
        details: section.description,
        qty: section.dateRange,
        unitCost: section.budget || 0,
        amount: section.budget || 0,
      };
    });

    const custom = (trip.customExpenses || []).map(exp => ({
      id: exp.id,
      sectionId: 'custom',
      category: exp.category,
      description: exp.description,
      details: exp.details,
      qty: '1',
      unitCost: exp.amount,
      amount: exp.amount,
    }));

    return [...sections, ...custom];
  }, [trip.sections, trip.customExpenses]);

  // Filter and search
  const filteredItems = invoiceItems.filter(item => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculations
  const subtotal = invoiceItems.reduce((acc, curr) => acc + curr.amount, 0);
  const tax = subtotal * 0.05; // 5% tax 
  const discount = 0;
  const grandTotal = subtotal + tax - discount;

  const totalBudget = trip.budget || 0;
  const totalSpent = grandTotal; 
  const remaining = totalBudget - totalSpent;
  const progressPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // Split logic
  const travelers = [trip.createdBy, 'Guest 1']; // Dynamic fallback
  const perPersonSplit = grandTotal / travelers.length;

  const handleDownloadCSV = () => {
    const headers = ['#', 'Category', 'Description', 'Details', 'Qty/Date', 'Unit Cost', 'Amount'];
    const rows = filteredItems.map((item, i) => [
      i + 1,
      `"${item.category}"`,
      `"${item.description}"`,
      `"${item.details}"`,
      `"${item.qty}"`,
      item.unitCost,
      item.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoice-${trip.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || Number(newExpense.amount) <= 0) return;
    
    const expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      description: newExpense.description,
      details: newExpense.details || 'Custom Expense',
      amount: Number(newExpense.amount),
    };

    updateTrip(trip.id, {
      customExpenses: [...(trip.customExpenses || []), expense]
    });
    
    setIsAddModalOpen(false);
    setNewExpense({ category: 'Activity', description: '', details: '', amount: '' });
  };

  return (
    <div className="page-transition max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 hide-print">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#0b1c30] text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Itinerary
        </button>
        <div className="flex gap-2">
          <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'} px-3 py-1 text-xs`}>
            {isPaid ? 'Fully Paid' : 'Payment Pending'}
          </span>
        </div>
      </div>

      {/* Top Cards Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Trip Info Card */}
        <div className="lg:col-span-2 card p-8 flex flex-col md:flex-row gap-8 bg-white shadow-sm border border-[#e2e8f0]">
          <div className="flex gap-6 flex-1">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#f1f5f9] border-2 border-white shadow-md flex-shrink-0 relative group">
              <img 
                src={trip.coverImage || '/images/dest-paris.jpg'} 
                alt={trip.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-heading font-black text-[#0b1c30] mb-2 tracking-tight">
                {trip.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-[#64748B] mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#0b1c30] font-bold text-xs">{trip.destination}</span>
                <span>•</span>
                <span>{trip.startDate} — {trip.endDate}</span>
              </div>
              <p className="text-xs text-[#94a3b8] font-medium uppercase tracking-widest mt-1">Organized by <span className="text-[#E8604C] font-bold">{trip.createdBy}</span></p>
            </div>
          </div>

          <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-[#e2e8f0] to-transparent"></div>

          {/* Invoice Meta */}
          <div className="flex-1 grid grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Invoice ID</p>
                <p className="text-sm font-bold text-[#0b1c30]">INV-{trip.id.slice(-6)}-{new Date().getFullYear()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Travelers ({travelers.length})</p>
                <div className="flex flex-col gap-1">
                  {travelers.map((t, i) => (
                    <span key={i} className="text-sm font-medium text-[#64748B] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E8604C]"></div>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Generated</p>
                <p className="text-sm font-bold text-[#0b1c30]">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#fff5f4] border border-[#ffdeda]">
                <p className="text-[10px] font-bold text-[#E8604C] uppercase tracking-widest mb-1">Split per person</p>
                <p className="text-lg font-black text-[#E8604C]">{formatCurrency(perPersonSplit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Insights */}
        <div className="card p-6 bg-white relative overflow-hidden shadow-sm border border-[#e2e8f0]">
          <div className="absolute -top-10 -right-10 p-4 opacity-[0.03]">
            <PieChart className="w-48 h-48 text-[#0b1c30]" />
          </div>
          <h3 className="text-sm font-heading font-bold text-[#0b1c30] mb-5 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#E8604C]" />
            Budget Insights
          </h3>
          
          <div className="flex items-center gap-5 mb-5 relative z-10">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 drop-shadow-sm">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#E8604C"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent > 100 ? 100 : progressPercent} ${100 - (progressPercent > 100 ? 100 : progressPercent)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[10px] font-bold text-[#0b1c30]">{Math.round(progressPercent)}%</span>
              </div>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Total Budget</span>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-[#f1f5f9] pb-1.5">
                <span className="text-[#64748B]">Total Spent</span>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between text-xs pt-0.5">
                <span className="text-[#64748B] font-medium">Remaining</span>
                <span className={`font-bold ${remaining < 0 ? 'text-[#E8604C]' : 'text-[#34d399]'}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Category Bars */}
          <div className="space-y-3 mb-4 relative z-10">
            {['Accommodation', 'Transport', 'Food & Tour', 'Activity'].map(cat => {
              const catTotal = invoiceItems.filter(i => i.category === cat).reduce((sum, i) => sum + i.amount, 0);
              const catPercent = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
              if (catTotal === 0) return null;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#64748B] font-bold uppercase tracking-wider">{cat}</span>
                    <span className="font-bold text-[#0b1c30]">{formatCurrency(catTotal)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        cat === 'Accommodation' ? 'bg-[#3b82f6]' :
                        cat === 'Transport' ? 'bg-[#f59e0b]' :
                        cat === 'Food & Tour' ? 'bg-[#10b981]' : 'bg-[#8b5cf6]'
                      }`}
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {remaining < 0 && (
            <div className="w-full p-2.5 bg-[#fff5f4] border border-[#ffdeda] text-[#E8604C] text-xs rounded-xl font-bold text-center flex items-center justify-center gap-2 mt-4">
              <TrendingUp className="w-4 h-4" />
              Budget Exceeded by {formatCurrency(Math.abs(remaining))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Table Area */}
      <div className="card overflow-hidden mb-6 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-[#e2e8f0] bg-[#f8fafc] gap-4 hide-print">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)} 
              className="input-field py-1.5 px-3 text-xs w-auto bg-white font-medium"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)} 
              className="input-field py-1.5 px-3 text-xs w-auto bg-white font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Transport">Transport</option>
              <option value="Food & Tour">Food & Tour</option>
              <option value="Activity">Activity</option>
            </select>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input 
                type="text" 
                placeholder="Search expenses..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="input-field pl-9 py-1.5 text-xs w-full bg-white"
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredItems.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap invoice-table">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <tr>
                  <th className="w-12 text-center text-[#64748B] text-[10px] uppercase tracking-wider font-bold py-4">#</th>
                  <th className="text-[#64748B] text-[10px] uppercase tracking-wider font-bold py-4">Category</th>
                  <th className="text-[#64748B] text-[10px] uppercase tracking-wider font-bold py-4">Description</th>
                  <th className="text-[#64748B] text-[10px] uppercase tracking-wider font-bold py-4">Duration / Date</th>
                  <th className="text-right text-[#64748B] text-[10px] uppercase tracking-wider font-bold py-4">Unit Cost</th>
                  <th className="text-right text-[#0b1c30] text-[10px] uppercase tracking-wider font-bold py-4 pr-6">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredItems.map((item, i) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors group cursor-default">
                    <td className="text-center text-[#94a3b8] font-medium py-4">{i + 1}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.category === 'Accommodation' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                        item.category === 'Transport' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                        item.category === 'Food & Tour' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                        'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-[#0b1c30] text-sm group-hover:text-[#E8604C] transition-colors">{item.description}</p>
                      <p className="text-xs text-[#64748B] truncate max-w-[250px] mt-0.5">{item.details}</p>
                    </td>
                    <td className="text-[#64748B] text-xs font-medium py-4">{item.qty}</td>
                    <td className="text-right text-[#94a3b8] text-xs font-medium py-4">{formatCurrency(item.unitCost)}</td>
                    <td className="text-right font-black text-[#0b1c30] text-sm py-4 pr-6">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-[#64748B]">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-[#e2e8f0]" />
              <p className="text-sm font-medium text-[#0b1c30]">No expenses found</p>
              <p className="text-xs">Try adjusting your filters or add activities to your itinerary.</p>
            </div>
          )}
        </div>

        {/* Totals Section */}
        {filteredItems.length > 0 && (
          <div className="p-8 bg-white border-t-2 border-dashed border-[#e2e8f0]">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div className="w-full sm:w-1/2 p-4 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Payment Notes</p>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  All costs are estimated based on current exchange rates and standard budgeting. Please note that exact prices may vary at the time of booking.
                </p>
              </div>
              <div className="w-full sm:w-72 space-y-3 text-sm bg-white">
                <div className="flex justify-between items-center text-[#64748B]">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-[#0b1c30]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[#64748B]">
                  <span className="font-medium">Tax (5%)</span>
                  <span className="font-bold text-[#0b1c30]">{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#E8604C]">
                    <span className="font-medium">Discount</span>
                    <span className="font-bold">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-5 border-t-2 border-[#0b1c30] mt-2">
                  <span className="text-sm font-black text-[#0b1c30] uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-[#E8604C] tracking-tight">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 hide-print">
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={handleDownloadCSV} className="btn-secondary py-2.5 px-6 text-xs flex-1 sm:flex-none justify-center group">
            <Download className="w-4 h-4 text-[#94a3b8] group-hover:text-[#0b1c30]" />
            Download CSV
          </button>
          <button onClick={handleExportPDF} className="btn-secondary py-2.5 px-6 text-xs flex-1 sm:flex-none justify-center group">
            <FileText className="w-4 h-4 text-[#94a3b8] group-hover:text-[#0b1c30]" />
            Export PDF
          </button>
        </div>
        <button 
          onClick={() => setIsPaid(!isPaid)}
          className={`btn-primary py-2.5 px-8 text-xs w-full sm:w-auto justify-center transition-all ${isPaid ? 'bg-[#059669] hover:bg-[#047857]' : ''}`}
        >
          {isPaid ? (
            <><CheckCircle2 className="w-4 h-4" /> Marked as Paid</>
          ) : (
            <><CreditCard className="w-4 h-4" /> Mark as Paid</>
          )}
        </button>
      </div>

      {/* Add Custom Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001b26]/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="card w-full max-w-md relative z-10 p-6 animate-scaleIn bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-h4 font-heading font-bold text-[#0b1c30]">Add Custom Expense</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#94a3b8] hover:text-[#0b1c30] rounded-lg hover:bg-[#f1f5f9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Category</label>
                <select 
                  className="input-field w-full text-sm py-2 px-3"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  required
                >
                  <option value="Accommodation">Accommodation</option>
                  <option value="Transport">Transport</option>
                  <option value="Food & Tour">Food & Tour</option>
                  <option value="Activity">Activity</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Description</label>
                <input 
                  type="text" 
                  className="input-field w-full text-sm py-2 px-3"
                  placeholder="e.g. Travel Insurance"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Details (Optional)</label>
                <input 
                  type="text" 
                  className="input-field w-full text-sm py-2 px-3"
                  placeholder="e.g. Coverage for 14 days"
                  value={newExpense.details}
                  onChange={(e) => setNewExpense({ ...newExpense, details: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm">$</span>
                  <input 
                    type="number" 
                    className="input-field w-full pl-7 text-sm py-2 px-3"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-2 px-6"
                  disabled={!newExpense.description || !newExpense.amount}
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

