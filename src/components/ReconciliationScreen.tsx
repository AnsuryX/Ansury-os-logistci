import React, { useState } from 'react';
import { ReconcileTransaction } from '../types';

interface ReconciliationScreenProps {
  transactions: ReconcileTransaction[];
  onOpenImportModal: () => void;
  onOpenClassifierDrawer: (txn: ReconcileTransaction) => void;
  onConfirmMatch: (id: string) => void;
  onRejectTxn: (id: string) => void;
  onBatchAutoMatch: () => void;
}

export const ReconciliationScreen: React.FC<ReconciliationScreenProps> = ({
  transactions,
  onOpenImportModal,
  onOpenClassifierDrawer,
  onConfirmMatch,
  onRejectTxn,
  onBatchAutoMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'matched' | 'unmatched' | 'suspicious'>('review');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTxns = transactions.filter((t) => t.status === activeTab);

  const tabCounts = {
    review: transactions.filter((t) => t.status === 'review').length,
    matched: transactions.filter((t) => t.status === 'matched').length,
    unmatched: transactions.filter((t) => t.status === 'unmatched').length,
    suspicious: transactions.filter((t) => t.status === 'suspicious').length,
  };

  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              Finance & Treasury / Corridor Clearing House / Auto-Reconcile v2.4
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              M-Pesa & Bank Reconciliation Engine
            </h1>
            <span className="font-label-code text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
              Live Feed Synced
            </span>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Automated matching of Safaricom Daraja B2C/C2B feeds, Paybill fuel disbursements & KCB Corporate EFT remittances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenImportModal}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Import Statement (CSV)
          </button>

          <button
            onClick={() => {
              onBatchAutoMatch();
              triggerToast('Batch Auto-Match: 8 high-confidence fuel & toll disbursements reconciled!');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            Batch Auto-Match (8)
          </button>
        </div>
      </div>

      {/* Live Statement Intake Card */}
      <div
        onClick={onOpenImportModal}
        className="bg-surface-container-low border border-dashed border-[#c7c4d8] rounded-2xl p-4 cursor-pointer hover:bg-surface-container transition-all flex flex-col sm:flex-row items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
          </div>
          <div>
            <div className="font-headline-sm text-[13px] font-bold text-on-surface">
              Drag & Drop Statement File or Tap to Ingest CSV
            </div>
            <div className="font-body-sm text-[11px] text-outline">
              Supports Safaricom Daraja API exports, KCB iBank, Equity EazzyBiz & TotalEnergies Card Logs.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label-code text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Till 402919 Online
          </span>
          <span className="font-label-code text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">
            KCB Corp Live
          </span>
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Reconciliation Rate
              </span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
              84.2%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Target: 95.0%</span>
            <span className="font-label-code text-on-surface-variant font-medium">38 / 45 Cleared</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Fleet Direct Spend
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              KES 1,480,200
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Verified Fleet Vouchers</span>
            <span className="font-label-code text-primary font-bold">Account 5010/5020</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Personal Draws Flagged
              </span>
              <span className="material-symbols-outlined text-amber-600 text-[18px]">person_off</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-amber-700 mt-2">
              KES 312,500
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Isolated from Fleet OPEX</span>
            <span className="font-label-code text-on-surface-variant font-medium">Account 3010 (Drawing)</span>
          </div>
        </div>
      </div>

      {/* Filter Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-2 rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span>Needs Review</span>
            <span className={`font-label-code text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'review' ? 'bg-white text-primary' : 'bg-surface-container text-outline'
            }`}>
              {tabCounts.review}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matched')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'matched'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span>Matched & Verified</span>
            <span className={`font-label-code text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'matched' ? 'bg-white text-primary' : 'bg-surface-container text-outline'
            }`}>
              {tabCounts.matched}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unmatched')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'unmatched'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span>Unmatched</span>
            <span className={`font-label-code text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'unmatched' ? 'bg-white text-primary' : 'bg-surface-container text-outline'
            }`}>
              {tabCounts.unmatched}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('suspicious')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'suspicious'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span>Suspicious & Duplicates</span>
            <span className={`font-label-code text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'suspicious' ? 'bg-white text-primary' : 'bg-error-container text-on-error-container'
            }`}>
              {tabCounts.suspicious}
            </span>
          </button>
        </div>

        {/* Date & Account dropdowns */}
        <div className="flex items-center gap-2">
          <select className="h-8 px-2 bg-surface-container-low rounded-lg font-body-sm text-[11px] text-on-surface border border-[#dce9ff] focus:outline-none">
            <option>All Accounts (M-Pesa + Banks)</option>
            <option>Safaricom Till 402919</option>
            <option>KCB Treasury Account</option>
            <option>Equity B2C Float</option>
          </select>
          <button
            onClick={() => triggerToast('Exporting Audit Trail to Excel...')}
            className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface transition-colors border border-[#dce9ff]"
            title="Export CSV"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      </div>

      {/* Primary Comparative Reconciliation Worktable */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-[10px] text-outline uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-2.5 px-4 w-1/3">Raw Telecoms / Bank Raw Feed</th>
                <th className="py-2.5 px-4 text-center">Confidence Gauge</th>
                <th className="py-2.5 px-4 w-1/3">Ansury ERP Suggested Record</th>
                <th className="py-2.5 px-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-outline font-body-sm">
                    No transactions found under "{activeTab}" filter.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => {
                  return (
                    <tr key={txn.id} className="hover:bg-surface-container-low/50 transition-colors">
                      {/* Left: Raw feed */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-label-code text-[9px] font-bold bg-surface-container px-1.5 py-0.2 rounded text-on-surface">
                                {txn.rawType}
                              </span>
                              <span className="font-label-code text-[11px] font-bold text-on-surface">
                                {txn.ref}
                              </span>
                            </div>
                            <div className="font-headline-sm text-[13px] font-bold text-on-surface mt-1">
                              {txn.merchantOrParty}
                            </div>
                            <div className="font-body-sm text-[11px] text-outline mt-0.5">
                              {txn.accountOrTarget} • {txn.timestamp}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-label-numeric text-[15px] font-bold text-on-surface">
                              KES {txn.amountKes.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Middle: Confidence Gauge */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <div className="inline-flex flex-col items-center">
                          {txn.confidenceType === 'ai' ? (
                            <div className="flex flex-col items-center">
                              <span className="font-label-numeric text-[14px] font-bold text-tertiary">
                                {txn.confidencePct}%
                              </span>
                              <span className="font-label-code text-[10px] text-tertiary bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                                {txn.confidenceLabel}
                              </span>
                            </div>
                          ) : txn.confidenceType === 'flagged' ? (
                            <div className="flex flex-col items-center">
                              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                              <span className="font-label-code text-[10px] text-error bg-red-50 px-2 py-0.5 rounded font-bold border border-red-200">
                                {txn.confidenceLabel}
                              </span>
                            </div>
                          ) : txn.confidenceType === 'verified' ? (
                            <div className="flex flex-col items-center">
                              <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                              <span className="font-label-code text-[10px] text-tertiary font-bold">
                                100% EFT Match
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="material-symbols-outlined text-outline text-[20px]">help_outline</span>
                              <span className="font-label-code text-[10px] text-outline font-bold">
                                {txn.confidenceLabel}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Right: ERP record */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]">
                          <div className="font-headline-sm text-[12px] font-bold text-on-surface">
                            {txn.erpTitle}
                          </div>
                          <div className="font-body-sm text-[11px] text-primary font-medium mt-0.5">
                            {txn.erpSubtitle}
                          </div>
                          <div className="font-label-sm text-[10px] text-outline mt-1">
                            {txn.erpDetails}
                          </div>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right align-middle">
                        <div className="flex flex-col items-end gap-1.5">
                          {txn.status === 'review' && (
                            <>
                              <button
                                onClick={() => {
                                  onConfirmMatch(txn.id);
                                  triggerToast(`Transaction ${txn.ref} verified and ledger matched!`);
                                }}
                                className="px-3 py-1 rounded-lg bg-primary text-on-primary font-label-code text-[11px] font-bold hover:bg-primary-container shadow-sm transition-all"
                              >
                                Confirm Match
                              </button>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <button
                                  onClick={() => {
                                    triggerToast(`Flagged ${txn.ref} as Owner/Director Personal Draw (Account 3010)`);
                                  }}
                                  className="text-outline hover:text-on-surface font-semibold"
                                >
                                  Mark as Personal
                                </button>
                                <span>•</span>
                                <button
                                  onClick={() => onOpenClassifierDrawer(txn)}
                                  className="text-primary hover:underline font-semibold"
                                >
                                  Change Cat
                                </button>
                              </div>
                            </>
                          )}

                          {txn.status === 'suspicious' && (
                            <>
                              <button
                                onClick={() => {
                                  onRejectTxn(txn.id);
                                  triggerToast(`Disputed duplicate charge ${txn.ref} with Shell Eldoret.`);
                                }}
                                className="px-3 py-1 rounded-lg bg-error text-white font-label-code text-[11px] font-bold hover:bg-error/90 shadow-sm"
                              >
                                Reject / Dispute
                              </button>
                              <button
                                onClick={() => triggerToast('Dialing Driver Joseph Mwangi (+254 722 000 111)...')}
                                className="text-[11px] text-outline hover:text-on-surface flex items-center gap-1 font-semibold"
                              >
                                <span className="material-symbols-outlined text-[14px]">call</span>
                                Call Driver
                              </button>
                            </>
                          )}

                          {txn.status === 'unmatched' && (
                            <>
                              <button
                                onClick={() => onOpenClassifierDrawer(txn)}
                                className="px-3 py-1 rounded-lg bg-primary text-on-primary font-label-code text-[11px] font-bold hover:bg-primary-container shadow-sm transition-all"
                              >
                                Classify Txn
                              </button>
                              <button
                                onClick={() => onOpenClassifierDrawer(txn)}
                                className="text-[11px] text-primary hover:underline font-semibold"
                              >
                                Assign to Fleet
                              </button>
                            </>
                          )}

                          {txn.status === 'matched' && (
                            <span className="font-label-code text-[11px] text-tertiary bg-emerald-50 px-2 py-1 rounded font-bold border border-emerald-200 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Reconciled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-[#e5eeff] flex items-center justify-between text-[11px] text-outline">
          <span className="font-label-code">
            Cryptographic reconciliation hash: <strong>SHA256: 4f8910a2bc...d8e1</strong>
          </span>
          <span className="font-label-code">Showing {filteredTxns.length} records</span>
        </div>
      </div>

      {/* Notice Banner: Owner Personal Drawings Isolation */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-800 text-[22px] mt-0.5">account_circle</span>
        <div>
          <div className="font-headline-sm text-[13px] font-bold text-amber-900">
            Why We Separate Owner/Director Personal M-Pesa Spend (Account 3010)
          </div>
          <p className="font-body-sm text-[12px] text-amber-800 mt-1 leading-relaxed">
            In Kenyan road transport operations, mingling owner personal withdrawals with fuel cards or trip disbursements distorts corridor P&L margins and risks KRA audit disallowances. Ansury isolates all non-freight transfers directly into Equity Drawings, preserving pure vehicle unit economics.
          </p>
        </div>
      </div>
    </div>
  );
};
