import React, { useState } from 'react';
import { Invoice, InvoicePayment, Customer, Vehicle, NavigationPath } from '../types';
import { INITIAL_INVOICES, INITIAL_AUDIT_LOGS } from '../data/mockInvoices';

interface InvoicesArScreenProps {
  customers: Customer[];
  vehicles?: Vehicle[];
  onNavigate?: (path: NavigationPath) => void;
  onNavigateToStatements?: () => void;
  onRecordBankPayment?: (invoice: Invoice, amount: number, ref: string) => void;
}

export const InvoicesArScreen: React.FC<InvoicesArScreenProps> = ({
  customers,
  vehicles,
  onNavigate,
  onNavigateToStatements,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [activeFilter, setActiveFilter] = useState<'all' | 'outstanding' | 'partially_paid' | 'paid' | 'overdue'>('all');
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'KES'>('USD');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Partial Payment Modal State
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'SWIFT Wire' | 'RTGS' | 'M-PESA' | 'Cheque'>('SWIFT Wire');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Refund / Credit Note Modal State
  const [selectedInvoiceForRefund, setSelectedInvoiceForRefund] = useState<Invoice | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<string>('');

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInvCustomer, setNewInvCustomer] = useState(customers[0]?.name || 'ONE PETROLEUM (U) LIMITED');
  const [newInvCorridor, setNewInvCorridor] = useState('Mombasa Port → Kampala Goodshed (Northern Corridor)');
  const [newInvWaybill, setNewInvWaybill] = useState('WB-2026-1045');
  const [newInvTruck, setNewInvTruck] = useState('KDA 542T');
  const [newInvCargo, setNewInvCargo] = useState('Heavy Fuel Oil (HFO) Bulk Transit');
  const [newInvAmount, setNewInvAmount] = useState('11800');
  const [newInvDueDate, setNewInvDueDate] = useState('2026-09-30');

  const fxRate = 127.2;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatMoney = (usd: number) => {
    if (currencyMode === 'USD') {
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const kes = usd * fxRate;
    return `KES ${kes.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.truckReg.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'outstanding') return inv.remainingBalance > 0 && inv.status !== 'voided';
    if (activeFilter === 'partially_paid') return inv.status === 'partially_paid';
    if (activeFilter === 'paid') return inv.status === 'paid';
    if (activeFilter === 'overdue') return inv.status === 'overdue';
    return true;
  });

  // KPI Calculations
  const totalInvoicedGross = invoices
    .filter((i) => i.status !== 'voided')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const totalCollectedCash = invoices
    .filter((i) => i.status !== 'voided')
    .reduce((acc, i) => acc + i.paidAmount, 0);

  const totalOutstandingAr = invoices
    .filter((i) => i.status !== 'voided' && i.status !== 'refunded')
    .reduce((acc, i) => acc + i.remainingBalance, 0);

  const overdueAr = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((acc, i) => acc + i.remainingBalance, 0);

  // Partial Payment Execution
  const handleApplyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Error: Please enter a valid positive payment amount.');
      return;
    }

    if (amt > selectedInvoiceForPayment.remainingBalance) {
      triggerToast(`Error: Payment ($${amt.toFixed(2)}) cannot exceed remaining balance ($${selectedInvoiceForPayment.remainingBalance.toFixed(2)}).`);
      return;
    }

    const newPayment: InvoicePayment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: amt,
      currency: selectedInvoiceForPayment.currency,
      method: paymentMethod,
      reference: paymentRef.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: paymentNotes.trim() || 'Payment processed and matched to invoice',
    };

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== selectedInvoiceForPayment.id) return inv;

        const updatedPaid = inv.paidAmount + amt;
        const updatedBalance = Math.max(0, inv.totalAmount - updatedPaid);
        const updatedStatus = updatedBalance === 0 ? ('paid' as const) : ('partially_paid' as const);

        return {
          ...inv,
          paidAmount: updatedPaid,
          remainingBalance: updatedBalance,
          status: updatedStatus,
          paymentHistory: [...inv.paymentHistory, newPayment],
        };
      })
    );

    triggerToast(`Payment of $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })} recorded successfully for ${selectedInvoiceForPayment.invoiceNumber}! Cash increased, AR reduced.`);
    setSelectedInvoiceForPayment(null);
    setPaymentAmount('');
    setPaymentRef('');
    setPaymentNotes('');
  };

  // Refund / Credit Note Execution
  const handleApplyRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForRefund) return;

    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0 || amt > selectedInvoiceForRefund.paidAmount) {
      triggerToast(`Error: Refund amount must be between $0.01 and paid total ($${selectedInvoiceForRefund.paidAmount.toFixed(2)}).`);
      return;
    }

    if (!refundReason.trim()) {
      triggerToast('Error: Mandatory audit rationale is required for issuing refunds/credit notes.');
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== selectedInvoiceForRefund.id) return inv;
        return {
          ...inv,
          status: 'refunded' as const,
          remainingBalance: 0,
          paidAmount: inv.paidAmount - amt,
          cargoDescription: `${inv.cargoDescription} [REFUND ISSUED: $${amt.toFixed(2)} - ${refundReason}]`,
        };
      })
    );

    triggerToast(`Credit Note & Refund of $${amt.toFixed(2)} issued for ${selectedInvoiceForRefund.invoiceNumber}. Contra-revenue logged to audit trail.`);
    setSelectedInvoiceForRefund(null);
    setRefundAmount('');
    setRefundReason('');
  };

  // Create New Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newInvAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Error: Please enter a valid invoice amount.');
      return;
    }

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: `cust-${Math.floor(Math.random() * 5) + 1}`,
      customerName: newInvCustomer,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newInvDueDate,
      currency: 'USD',
      totalAmount: amt,
      paidAmount: 0,
      remainingBalance: amt,
      status: 'issued',
      corridor: newInvCorridor,
      waybillNumber: newInvWaybill,
      truckReg: newInvTruck,
      cargoDescription: newInvCargo,
      paymentHistory: [],
    };

    setInvoices((prev) => [newInv, ...prev]);
    triggerToast(`Invoice ${newInv.invoiceNumber} created for ${newInvCustomer}! AR updated.`);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="p-space-lg space-y-space-lg pb-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">verified</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-code text-[11px] font-bold bg-primary text-white px-2 py-0.5 rounded">
              VERIFIED AR ENGINE
            </span>
            <span className="font-label-code text-[11px] text-outline">
              East Africa Trade Corridors • Accrual Accounting Isolation
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Invoices & Accounts Receivable (AR)
            </h1>
            <span className="font-label-code text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Real Ledger Active
            </span>
          </div>

          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Track shipper freight billings, partial milestone receipts, credit aging, and strict cash vs AR separation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Toggle */}
          <div className="bg-surface-container-low p-1 rounded-xl border border-[#dce9ff] flex items-center">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1 rounded-lg font-label-code text-[12px] font-bold transition-all ${
                currencyMode === 'USD' ? 'bg-primary text-white shadow-sm' : 'text-outline hover:text-on-surface'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrencyMode('KES')}
              className={`px-3 py-1 rounded-lg font-label-code text-[12px] font-bold transition-all ${
                currencyMode === 'KES' ? 'bg-primary text-white shadow-sm' : 'text-outline hover:text-on-surface'
              }`}
            >
              KES (@ 127.2)
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Issue Freight Invoice
          </button>
        </div>
      </div>

      {/* Top 4 Real AR Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Invoiced (Accrual) */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Total Invoiced (Accrual)
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              {formatMoney(totalInvoicedGross)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Total Freight Billed</span>
            <span className="font-label-code text-on-surface-variant font-medium">8 Waybills MTD</span>
          </div>
        </div>

        {/* Metric 2: Actual Liquid Cash Collected */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-emerald-800 uppercase font-semibold">
                Liquid Cash Collected
              </span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">payments</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
              {formatMoney(totalCollectedCash)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-800">In Bank Account</span>
            <span className="font-label-code text-tertiary font-bold">100% Realized Cash</span>
          </div>
        </div>

        {/* Metric 3: Outstanding Accounts Receivable (AR) */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-amber-800 uppercase font-semibold">
                Outstanding AR (Uncollected)
              </span>
              <span className="material-symbols-outlined text-amber-700 text-[20px]">pending_actions</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-amber-800 mt-2">
              {formatMoney(totalOutstandingAr)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-800 font-bold">NOT in Cash Float</span>
            <span className="font-label-code text-amber-900 font-semibold">Accrual Asset Only</span>
          </div>
        </div>

        {/* Metric 4: Overdue Receivables (>30 Days) */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-rose-800 uppercase font-semibold">
                Overdue Receivables
              </span>
              <span className="material-symbols-outlined text-rose-600 text-[20px]">warning</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-rose-800 mt-2">
              {formatMoney(overdueAr)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px]">
            <span className="text-rose-800">Mogas Uganda Ltd</span>
            <span className="font-label-code text-rose-900 font-bold">Aging: 45 Days</span>
          </div>
        </div>
      </div>

      {/* INDEPENDENT VERIFICATION NOTICE: Unpaid Invoices Don't Appear As Cash */}
      <div className="p-4 bg-surface-container-low rounded-2xl border border-[#dce9ff] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
          <div>
            <span className="font-headline-sm text-[13px] font-bold text-on-surface block">
              Accounting Isolation Rule: Unpaid Invoices Are Strictly Excluded From Cash
            </span>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              The outstanding receivables balance of <strong>{formatMoney(totalOutstandingAr)}</strong> represents uncollected contractual claims. Under international freight accounting standards, it sits on the Balance Sheet as a current asset, but is completely excluded from liquid cash until cleared via SWIFT or RTGS.
            </p>
          </div>
        </div>

        {onNavigateToStatements && (
          <button
            onClick={onNavigateToStatements}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container font-body-sm text-[12px] font-semibold text-primary transition-colors shrink-0 flex items-center gap-1"
          >
            <span>View Cash Flow vs P&L</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        )}
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-[#dce9ff] hover:bg-surface-container'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveFilter('outstanding')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1 ${
              activeFilter === 'outstanding'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-[#dce9ff] hover:bg-surface-container'
            }`}
          >
            <span>Outstanding</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </button>
          <button
            onClick={() => setActiveFilter('partially_paid')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1 ${
              activeFilter === 'partially_paid'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-[#dce9ff] hover:bg-surface-container'
            }`}
          >
            <span>Partially Paid</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          </button>
          <button
            onClick={() => setActiveFilter('paid')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1 ${
              activeFilter === 'paid'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-[#dce9ff] hover:bg-surface-container'
            }`}
          >
            <span>Paid in Full</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </button>
          <button
            onClick={() => setActiveFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1 ${
              activeFilter === 'overdue'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-[#dce9ff] hover:bg-surface-container'
            }`}
          >
            <span>Overdue</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search invoice #, customer, waybill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] font-body-sm text-[12px] w-64 focus:outline-none focus:border-primary text-on-surface"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">
            search
          </span>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#e5eeff] text-outline font-label-sm uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice / Waybill</th>
                <th className="py-3 px-4">Customer & Corridor</th>
                <th className="py-3 px-4">Issue & Due Date</th>
                <th className="py-3 px-4 text-right">Total Billed</th>
                <th className="py-3 px-4 text-right">Paid to Date</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredInvoices.map((inv) => {
                const isOverdue = inv.status === 'overdue';
                const isPartiallyPaid = inv.status === 'partially_paid';
                const isPaid = inv.status === 'paid';
                const isRefunded = inv.status === 'refunded';

                return (
                  <tr key={inv.id} className="hover:bg-surface-container-low/50 transition-colors">
                    {/* Invoice & Waybill */}
                    <td className="py-3 px-4">
                      <div className="font-label-code font-bold text-primary text-[13px]">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-outline flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span>{inv.waybillNumber} • {inv.truckReg}</span>
                      </div>
                    </td>

                    {/* Customer & Corridor */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-on-surface truncate">
                        {inv.customerName}
                      </div>
                      <div className="text-[11px] text-outline truncate mt-0.5" title={inv.corridor}>
                        {inv.corridor}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4">
                      <div className="text-on-surface font-medium">{inv.issueDate}</div>
                      <div className={`text-[11px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-outline'}`}>
                        Due: {inv.dueDate} {isOverdue && '(OVERDUE)'}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-label-numeric font-bold text-on-surface text-[13px]">
                      {formatMoney(inv.totalAmount)}
                    </td>

                    {/* Paid to Date */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-label-numeric font-bold text-tertiary">
                        {formatMoney(inv.paidAmount)}
                      </span>
                      {inv.paymentHistory.length > 0 && (
                        <div className="text-[10px] text-outline">
                          {inv.paymentHistory.length} payment(s)
                        </div>
                      )}
                    </td>

                    {/* Balance Due */}
                    <td className="py-3 px-4 text-right">
                      <span className={`font-label-numeric font-bold text-[13px] ${
                        inv.remainingBalance > 0 ? (isOverdue ? 'text-rose-700' : 'text-amber-800') : 'text-outline'
                      }`}>
                        {formatMoney(inv.remainingBalance)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isPaid && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          PAID IN FULL
                        </span>
                      )}
                      {isPartiallyPaid && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          PARTIAL ({((inv.paidAmount / inv.totalAmount) * 100).toFixed(0)}%)
                        </span>
                      )}
                      {inv.status === 'issued' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          ISSUED / UNPAID
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          OVERDUE
                        </span>
                      )}
                      {inv.status === 'draft' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          DRAFT
                        </span>
                      )}
                      {isRefunded && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          REFUNDED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Record Partial / Full Payment Button */}
                        {inv.remainingBalance > 0 && inv.status !== 'voided' && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceForPayment(inv);
                              setPaymentAmount(inv.remainingBalance.toString());
                              setPaymentRef(`RTGS-${Math.floor(100000 + Math.random() * 900000)}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-body-sm text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                            title="Record Partial or Full Payment"
                          >
                            <span className="material-symbols-outlined text-[13px]">payments</span>
                            <span>Pay</span>
                          </button>
                        )}

                        {/* Issue Refund / Credit Note Button */}
                        {inv.paidAmount > 0 && !isRefunded && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceForRefund(inv);
                              setRefundAmount(inv.paidAmount.toString());
                              setRefundReason('Shipper fuel rebate adjustment or cargo volume variance');
                            }}
                            className="px-2 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface font-body-sm text-[11px] font-semibold transition-colors border border-[#dce9ff]"
                            title="Issue Refund / Credit Note"
                          >
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PARTIAL / FULL PAYMENT MODAL */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 border border-[#dce9ff] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Record Inward Payment
                </h3>
                <p className="font-body-sm text-[12px] text-outline">
                  Invoice: {selectedInvoiceForPayment.invoiceNumber} • {selectedInvoiceForPayment.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="p-1 rounded-lg hover:bg-surface-container text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl space-y-1 text-[12px]">
              <div className="flex justify-between">
                <span className="text-outline">Total Invoice Amount:</span>
                <span className="font-label-numeric font-bold text-on-surface">
                  ${selectedInvoiceForPayment.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Previously Collected:</span>
                <span className="font-label-numeric font-bold text-tertiary">
                  ${selectedInvoiceForPayment.paidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#dce9ff]">
                <span className="font-bold text-on-surface">Current Remaining Balance:</span>
                <span className="font-label-numeric font-bold text-amber-800 text-[13px]">
                  ${selectedInvoiceForPayment.remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleApplyPayment} className="space-y-3 text-[12px]">
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Payment Amount to Record (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedInvoiceForPayment.remainingBalance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-label-numeric font-bold text-[14px] focus:outline-none focus:border-primary"
                  required
                />
                <span className="text-[11px] text-outline mt-0.5 block">
                  You can enter a partial payment amount (e.g. $4,000.00). The remaining amount will remain in AR.
                </span>
              </div>

              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Payment Channel / Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-medium focus:outline-none focus:border-primary"
                >
                  <option value="SWIFT Wire">SWIFT Wire (pacs.008 MT103)</option>
                  <option value="RTGS">Bank RTGS Clearing</option>
                  <option value="M-PESA">Safaricom M-PESA B2B</option>
                  <option value="Cheque">Commercial Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Bank Reference / SWIFT UETR *
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. S0662191EFAF01 or UETR: 66393c7c..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Audit Notes / Remittance Details
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Partial advance milestone for Northern Corridor fuel float"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Confirm & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFUND / CREDIT NOTE MODAL */}
      {selectedInvoiceForRefund && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 border border-rose-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-rose-900">
                  Issue Refund / Credit Note
                </h3>
                <p className="font-body-sm text-[12px] text-outline">
                  Invoice: {selectedInvoiceForRefund.invoiceNumber} • Paid: ${selectedInvoiceForRefund.paidAmount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForRefund(null)}
                className="p-1 rounded-lg hover:bg-surface-container text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleApplyRefund} className="space-y-3 text-[12px]">
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Refund Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedInvoiceForRefund.paidAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-label-numeric font-bold text-[14px] focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Mandatory Audit Rationale *
                </label>
                <textarea
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Specify auditor justification (e.g. Weighbridge calibration variance, customer demurrage credit)..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForRefund(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">undo</span>
                  Post Contra-Revenue Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FREIGHT INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-[#dce9ff] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Issue New Freight Invoice
                </h3>
                <p className="font-body-sm text-[12px] text-outline">
                  Generate formal billing manifest for cross-border haulage
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-[12px]">
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Customer / Shipper *
                </label>
                <select
                  value={newInvCustomer}
                  onChange={(e) => setNewInvCustomer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-medium focus:outline-none focus:border-primary"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.corridor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                    Transit Waybill Number *
                  </label>
                  <input
                    type="text"
                    value={newInvWaybill}
                    onChange={(e) => setNewInvWaybill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-label-code focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                    Assigned Prime Mover *
                  </label>
                  <input
                    type="text"
                    value={newInvTruck}
                    onChange={(e) => setNewInvTruck(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-label-code focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Cargo Description & Volume *
                </label>
                <input
                  type="text"
                  value={newInvCargo}
                  onChange={(e) => setNewInvCargo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                    Invoice Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newInvAmount}
                    onChange={(e) => setNewInvAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-label-numeric font-bold text-[14px] focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    value={newInvDueDate}
                    onChange={(e) => setNewInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Issue & Send Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
