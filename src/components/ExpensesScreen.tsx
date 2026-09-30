import React, { useState } from 'react';
import { ExpenseClaim } from '../types';
import { useAuth } from '../lib/auth';
import { downloadCsv } from '../utils/format';

interface ExpensesScreenProps {
  expenses: ExpenseClaim[];
  onOpenQuickExpense: () => void;
  onOpenReceiptAudit: (claim: ExpenseClaim) => void;
  onApproveExpense: (id: string) => void;
  onRejectExpense: (id: string, reason?: string) => void;
  onHoldExpense: (id: string) => void;
  onDeleteExpense?: (id: string, reason: string) => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  expenses,
  onOpenQuickExpense,
  onOpenReceiptAudit,
  onApproveExpense,
  onRejectExpense,
  onHoldExpense,
  onDeleteExpense,
}) => {
  const { user, role, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeAuditor, setActiveAuditor] = useState<'controller' | 'submitter'>('controller');
  const [voidModalClaim, setVoidModalClaim] = useState<ExpenseClaim | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportKraSchedule = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const headers = [
      'Claim Number',
      'Submission Date',
      'Expense Category',
      'Amount (KES)',
      '16% VAT Included (KES)',
      'Vendor / Merchant',
      'M-Pesa / Bank Reference',
      'Truck Asset Plate',
      'Corridor Route',
      'Driver Name',
      'Submitted By',
      'Approved By',
      'Approval Status',
      'CANBUS Telemetry Verification',
      'Receipt Attachment Status',
    ];

    const rows = filteredExpenses.map((e) => [
      e.claimNumber,
      e.submittedTime,
      e.category,
      e.amountKes,
      Number(((e.amountKes * 0.16) / 1.16).toFixed(2)),
      e.vendor,
      e.mpesaRef,
      e.truckAsset,
      e.route,
      e.driverName,
      e.submittedBy,
      e.approvedBy || 'Pending',
      e.status.toUpperCase(),
      e.telemetryPass ? 'PASSED — Odometer Verified' : 'FLAGGED',
      e.receiptAttached ? 'ATTACHED (ETR Scanned)' : 'MISSING',
    ]);

    downloadCsv(`Ansury_KRA_Section23_Expense_Schedule_${dateStr}.csv`, [headers, ...rows]);
    triggerToast(`Exported ${filteredExpenses.length} expense vouchers to KRA tax schedule CSV!`);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.truckAsset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const pendingCount = expenses.filter((e) => e.status === 'pending').length;
  const approvedCount = expenses.filter((e) => e.status === 'approved').length;
  const rejectedCount = expenses.filter((e) => e.status === 'rejected').length;

  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              East African Corridors • FinAudit Live
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Expenses & Approvals Control
            </h1>
            <span className="font-label-code text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
              Owner Terminal
            </span>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Real-time audit control, telemetry fuel validation, ETR compliance & cross-border cash float approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Auditor Switcher for Policy SEC-04 Testing */}
          <div className="bg-surface-container-low p-1 rounded-xl border border-[#dce9ff] flex items-center text-[11px]">
            <span className="text-outline px-2 font-medium">Auditor Role:</span>
            <button
              onClick={() => {
                setActiveAuditor('controller');
                triggerToast('Active Role: David Kimani (Independent Controller) - Dual Approval Enabled');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeAuditor === 'controller'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Independent Controller
            </button>
            <button
              onClick={() => {
                setActiveAuditor('submitter');
                triggerToast('Active Role: Akbar Ahmed (Director & Submitter) - Self-Approval Block Active');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeAuditor === 'submitter'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Director (Submitter)
            </button>
          </div>

          <button
            onClick={handleExportKraSchedule}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            title="Download KRA Tax Schedule CSV"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Export KRA Schedule (.csv)
          </button>

          <button
            onClick={onOpenQuickExpense}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            + Add Expense (30-Sec Quick Entry)
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Pending Approvals
              </span>
              <span className="material-symbols-outlined text-amber-600 text-[18px]">pending_actions</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              {pendingCount} Claims
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">KES 142,500 Total</span>
            <span className="font-label-code text-amber-700 font-bold">+2 Submitted today</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Approved This Month
              </span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
              {approvedCount} Processed
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">KES 1.82M Cleared</span>
            <span className="font-label-code text-on-surface-variant font-medium">Fuel 74% • Tolls 14%</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Rejected / Flagged
              </span>
              <span className="material-symbols-outlined text-error text-[18px]">cancel</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-error mt-2">
              {rejectedCount} Disputed
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">KES 68,000 Recovered</span>
            <span className="font-label-code text-error font-bold">2 Missing Receipts</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Missing Receipts
              </span>
              <span className="material-symbols-outlined text-outline text-[18px]">receipt_long</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              8 Pending
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">KES 94,300 Held</span>
            <span className="font-label-code text-amber-700 font-bold">Driver SMS Reminders Sent</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-3 rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search claims by vendor, driver, truck, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-9 pr-3 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-[#dce9ff]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 px-2.5 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="fuel">Fuel Refills</option>
            <option value="border">Border Transit</option>
            <option value="tyre">Tyres & Maintenance</option>
            <option value="allowance">Driver Allowance</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="h-8 px-3 rounded-lg bg-surface-container-low text-outline hover:text-on-surface text-[12px] font-semibold transition-colors border border-[#dce9ff]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Action Required Claims (Review Queue) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-[14px] font-bold text-on-surface">
              ACTION REQUIRED CLAIMS ({filteredExpenses.length})
            </h2>
            <span className="font-label-code text-[11px] text-outline">
              Showing pending audit verifications
            </span>
          </div>

          <div className="space-y-4">
            {filteredExpenses.map((claim) => (
              <div
                key={claim.id}
                className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3"
              >
                {/* Claim Top Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e5eeff]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-code text-[12px] font-bold text-on-surface">
                        {claim.claimNumber}
                      </span>
                      <span className="font-headline-sm text-[13px] font-bold text-on-surface">
                        {claim.category}
                      </span>
                    </div>
                    <div className="font-body-sm text-[11px] text-outline mt-0.5">
                      {claim.vendor} • {claim.mpesaRef}
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="font-label-numeric text-[20px] font-bold text-on-surface block">
                      KES {claim.amountKes.toLocaleString()}
                    </span>
                    <span className="font-label-code text-[10px] text-outline">
                      Submitted {claim.submittedTime} by {claim.submittedBy}
                    </span>
                  </div>
                </div>

                {/* Truck & Route Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12px] bg-surface-container-low p-2.5 rounded-xl border border-[#dce9ff]">
                  <div>
                    <span className="text-outline text-[10px] uppercase font-semibold block">Truck Asset</span>
                    <span className="font-label-code font-bold text-on-surface">{claim.truckAsset}</span>
                  </div>
                  <div>
                    <span className="text-outline text-[10px] uppercase font-semibold block">Dispatch Manifest</span>
                    <span className="font-label-code font-bold text-primary">{claim.dispatchId}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-outline text-[10px] uppercase font-semibold block">Driver</span>
                    <span className="font-medium text-on-surface">{claim.driverName} ({claim.driverId})</span>
                  </div>
                </div>

                {/* Audit Signals */}
                {claim.telemetryPass && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-start gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                      verified
                    </span>
                    <div className="text-emerald-900">
                      <strong>Telemetry Auto-Verification:</strong> {claim.telemetryNote}
                    </div>
                  </div>
                )}

                {claim.varianceFlag && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-start gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">
                      warning
                    </span>
                    <div className="text-amber-900">
                      <strong>Policy Cap Exceeded:</strong> {claim.varianceNote}
                    </div>
                  </div>
                )}

                {claim.missingReceipt && (
                  <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-start gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">
                      error
                    </span>
                    <div className="text-error">
                      <strong>Missing Fiscal ETR Receipt:</strong> {claim.telemetryNote}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#eff4ff]">
                  <div className="flex items-center gap-2">
                    {claim.receiptAttached && (
                      <button
                        onClick={() => onOpenReceiptAudit(claim)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-code text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        View Receipt (1)
                      </button>
                    )}
                    <button
                      onClick={() => triggerToast(`Query ping dispatched to driver ${claim.driverName} & Ops manager.`)}
                      className="px-2.5 py-1 rounded-lg text-outline hover:text-on-surface font-body-sm text-[11px] font-semibold transition-colors"
                    >
                      Query Ops
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {(role === 'super_admin' || role === 'finance_controller' || permissions.canDeleteRecords) && (
                      <button
                        onClick={() => setVoidModalClaim(claim)}
                        className="px-2.5 py-1 rounded-lg text-outline hover:text-rose-600 font-body-sm text-[11px] font-semibold transition-colors flex items-center gap-1 border border-slate-200 hover:border-rose-300"
                        title="Audited Void & Delete Voucher (Controller / Admin Only)"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Void</span>
                      </button>
                    )}

                    <button
                      disabled={!permissions.canApproveExpenses}
                      onClick={() => {
                        onRejectExpense(claim.id);
                        triggerToast(`Expense claim ${claim.claimNumber} rejected.`);
                      }}
                      className="px-3 py-1 rounded-lg text-error hover:bg-error-container/30 font-body-sm text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>

                    {role === 'driver' ? (
                      <div
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-body-sm text-[11px] font-semibold flex items-center gap-1 cursor-not-allowed"
                        title="Driver permissions: Read-only visibility."
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>Read-Only</span>
                      </div>
                    ) : activeAuditor === 'submitter' || (user?.fullName && (claim.submittedBy?.toLowerCase() === user.fullName.toLowerCase() || claim.driverName?.toLowerCase() === user.fullName.toLowerCase())) ? (
                      <div
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-body-sm text-[11px] font-bold flex items-center gap-1 cursor-not-allowed"
                        title="Policy SEC-04: Submitter cannot approve their own claim. Dual approval by Independent Controller required."
                      >
                        <span className="material-symbols-outlined text-[14px] text-amber-700">lock</span>
                        <span>Self-Approval Prohibited</span>
                      </div>
                    ) : claim.missingReceipt ? (
                      <button
                        disabled={!permissions.canApproveExpenses}
                        onClick={() => {
                          onHoldExpense(claim.id);
                          triggerToast(`Claim ${claim.claimNumber} placed on temporary hold awaiting driver upload.`);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 font-body-sm text-[12px] font-semibold hover:bg-slate-300 transition-colors disabled:opacity-40"
                      >
                        Temporary Hold
                      </button>
                    ) : (
                      <button
                        disabled={!permissions.canApproveExpenses}
                        onClick={() => {
                          onApproveExpense(claim.id);
                          triggerToast(`Approved ${claim.claimNumber} (KES ${claim.amountKes.toLocaleString()}) by Controller.`);
                        }}
                        className="px-3 py-1 rounded-lg bg-primary text-on-primary font-body-sm text-[12px] font-medium hover:bg-primary-container shadow-sm transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[15px]">done</span>
                        Approve (KES {claim.amountKes.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Engine Policies & Float Tanks */}
        <div className="lg:col-span-4 space-y-4">
          {/* Policy Rules */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#e5eeff]">
              <span className="material-symbols-outlined text-primary text-[20px]">policy</span>
              <h3 className="font-headline-sm text-[13px] font-bold text-on-surface">
                CONTROL ENGINE POLICIES
              </h3>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2 p-2 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-tertiary text-[16px] mt-0.5">check</span>
                <div>
                  <span className="font-bold text-on-surface block">Director Dual Approval</span>
                  <span className="text-outline">Required for any workshop or tyre expense &gt;KES 40,000.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-tertiary text-[16px] mt-0.5">check</span>
                <div>
                  <span className="font-bold text-on-surface block">Fuel Odometer Verification</span>
                  <span className="text-outline">CANBUS telemetry must match fill volume within ±3.0%.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-tertiary text-[16px] mt-0.5">check</span>
                <div>
                  <span className="font-bold text-on-surface block">Self-Approval Prevention</span>
                  <span className="text-outline">Drivers cannot authorize petty cash outlays for their own route.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Float Tanks */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <span className="font-headline-sm text-[13px] font-bold text-on-surface">
                OPERATIONAL FLOAT TANKS
              </span>
              <span className="font-label-code text-[10px] text-tertiary font-bold bg-emerald-50 px-2 py-0.5 rounded">
                HEALTHY
              </span>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="p-2.5 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                <div>
                  <span className="font-medium text-on-surface block">M-Pesa B2C Paybill</span>
                  <span className="text-[10px] text-outline font-label-code">Till: 809214 • Driver Float</span>
                </div>
                <span className="font-label-numeric font-bold text-on-surface">
                  KES 482,400
                </span>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                <div>
                  <span className="font-medium text-on-surface block">TotalEnergies Card Pool</span>
                  <span className="text-[10px] text-outline font-label-code">Fleet Master Card #9021</span>
                </div>
                <span className="font-label-numeric font-bold text-on-surface">
                  KES 310,950
                </span>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                <div>
                  <span className="font-medium text-on-surface block">Border Station Petty Float</span>
                  <span className="text-[10px] text-outline font-label-code">Malaba & Busia Vault</span>
                </div>
                <span className="font-label-numeric font-bold text-on-surface">
                  KES 14,200
                </span>
              </div>
            </div>
          </div>

          {/* Mini Chart: Trip Fuel Expense Index */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-2">
            <span className="font-headline-sm text-[12px] font-bold text-on-surface block">
              CORRIDOR FUEL EXPENSE INDEX
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-outline">
                <span>NBO → MOM (1,000 km return)</span>
                <span className="font-label-numeric font-bold text-on-surface">KES 72,000</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }}></div>
              </div>

              <div className="flex justify-between text-outline pt-1">
                <span>NBO → KLA (1,300 km transit)</span>
                <span className="font-label-numeric font-bold text-on-surface">KES 111,600</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AUDITED VOID / SOFT DELETE MODAL */}
      {voidModalClaim && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 border border-rose-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-rose-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-rose-600 text-[20px]">gavel</span>
                  Audited Void / Soft Delete
                </h3>
                <p className="font-body-sm text-[12px] text-outline">
                  Claim: {voidModalClaim.claimNumber} • KES {voidModalClaim.amountKes.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setVoidModalClaim(null)}
                className="p-1 rounded-lg hover:bg-surface-container text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-[12px] text-rose-900 space-y-1">
              <span className="font-bold block">Regulatory Audit Requirement:</span>
              <p className="text-[11px] text-rose-800">
                Financial records cannot be silently deleted. Voiding writes an immutable tombstone record in the audit trail recording your user ID, timestamp, and justification.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!voidReason.trim()) {
                  triggerToast('Error: Mandatory audit justification is required to void this claim.');
                  return;
                }
                if (onDeleteExpense) {
                  onDeleteExpense(voidModalClaim.id, voidReason);
                } else {
                  onRejectExpense(voidModalClaim.id, voidReason);
                }
                triggerToast(`Claim ${voidModalClaim.claimNumber} voided with audit tombstone. Logged to immutable audit trail.`);
                setVoidModalClaim(null);
                setVoidReason('');
              }}
              className="space-y-3 text-[12px]"
            >
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Mandatory Auditor Rationale *
                </label>
                <textarea
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Specify why this financial voucher is being voided (e.g. Duplicate fuel slip, incorrect fleet asset, merchant refund)..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVoidModalClaim(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Record Audited Void
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
