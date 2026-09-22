import React, { useState } from 'react';
import { NavigationPath, Vehicle } from '../types';

interface DashboardScreenProps {
  vehicles: Vehicle[];
  onNavigate: (path: NavigationPath) => void;
  onOpenQuickExpense: () => void;
  userName?: string;
  companyName?: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  vehicles,
  onNavigate,
  onOpenQuickExpense,
  userName = 'David Kimani',
  companyName = 'BEYAYAN LIMITED',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | '7 Days' | 'This Month' | 'Last Month' | 'Custom'>('This Month');
  const [fleetSearch, setFleetSearch] = useState('');
  const [clearedAttentionIds, setClearedAttentionIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const attentionItems = [
    {
      id: 'att-1',
      title: 'KDA 542T • Nairobi-Eldoret',
      desc: '+14.2% Fuel Spike on escarpment section vs fleet benchmark.',
      actionText: 'Investigate Telemetry',
      badge: 'URGENT ANOMALY',
      badgeClass: 'bg-error-container text-on-error-container',
      icon: 'warning',
      action: () => onNavigate('anomalies-engine'),
    },
    {
      id: 'att-2',
      title: 'Voucher Audit Compliance',
      desc: '8 Receipts Missing in pending claims (KES 94.3K unverified float).',
      actionText: 'Review Expenses',
      badge: 'ACTION REQUIRED',
      badgeClass: 'bg-amber-100 text-amber-900',
      icon: 'receipt_long',
      action: () => onNavigate('expenses'),
    },
    {
      id: 'att-3',
      title: 'Trip #TRP-0241 Unbilled',
      desc: 'POD stamped 3 days ago. KES 410,000 awaiting commercial invoice.',
      actionText: 'Generate Invoice',
      badge: 'BILLING STALE',
      badgeClass: 'bg-blue-100 text-blue-900',
      icon: 'request_quote',
      action: () => {
        triggerToast('Commercial Invoice #INV-1085 generated for Vivo Energy Uganda (KES 410,000)');
      },
    },
    {
      id: 'att-4',
      title: 'M-Pesa Discrepancy',
      desc: 'KES 45,000 unmapped P2P transfer to mechanic in Nakuru workshop.',
      actionText: 'Reconcile Feed',
      badge: 'FLOAT AUDIT',
      badgeClass: 'bg-purple-100 text-purple-900',
      icon: 'sync_alt',
      action: () => onNavigate('reconciliation'),
    },
    {
      id: 'att-5',
      title: 'AR Aging: #INV-1082 Overdue 14d',
      desc: 'Vivo Energy Uganda • KES 410,000 payment past agreed credit terms.',
      actionText: 'Send Reminder',
      badge: 'COLLECTION DUE',
      badgeClass: 'bg-amber-100 text-amber-900',
      icon: 'mail',
      action: () => {
        triggerToast('Automated statement & KRA ETR payment reminder dispatched to Vivo Treasury.');
      },
    },
  ].filter((item) => !clearedAttentionIds.includes(item.id));

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.reg.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      v.driver.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      v.corridor.toLowerCase().includes(fleetSearch.toLowerCase())
  );

  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">info</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Top Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Good morning, {userName.split(' ')[0]}
            </h1>
            <span className="font-label-code text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
              {companyName} • FLIGHT DECK
            </span>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Real-time haulage telematics, cash float reconciliation & corridor margins across Kenya, Uganda & Rwanda.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector Tabs */}
          <div className="bg-surface-container-low p-1 rounded-xl border border-[#dce9ff] flex items-center text-[12px] font-medium">
            {(['Today', '7 Days', 'This Month', 'Last Month', 'Custom'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedPeriod === period
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => triggerToast('Generating Executive Haulage Report (PDF & Excel)...')}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Export Report
          </button>

          <button
            onClick={onOpenQuickExpense}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            + Expense
          </button>

          <button
            onClick={() => onNavigate('trips')}
            className="px-3.5 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface hover:bg-slate-800 font-body-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add_road</span>
            New Trip
          </button>
        </div>
      </div>

      {/* Daily AI Executive Briefing Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-primary/20 shadow-[0_1px_12px_rgba(53,37,205,0.06)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-[14px] font-bold text-on-surface">
                  DAILY AI EXECUTIVE BRIEFING
                </span>
                <span className="font-label-code text-[10px] text-tertiary font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  CONFIDENCE 98.4%
                </span>
              </div>
              <span className="font-label-code text-[11px] text-outline">
                COMPUTED AGAINST 52 ACTIVE ASSETS • RUN ID: AI-NBI-8021
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ansury-ai-cfo')}
            className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-label-code text-[11px] font-bold transition-colors flex items-center gap-1 self-start md:self-auto"
          >
            <span>Query Copilot</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-3">
          <div className="p-2 rounded-xl bg-surface-container-low border border-[#dce9ff]">
            <span className="font-label-code text-[10px] text-primary font-bold block uppercase">
              01. Topline Lift
            </span>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
              Fleet revenue pace running <strong>11.2% ahead</strong> of target due to quick turnaround at Malaba OSBP.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-error-container/20 border border-error/20">
            <div className="flex items-center justify-between">
              <span className="font-label-code text-[10px] text-error font-bold uppercase">
                02. Fuel Alert
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
            </div>
            <p className="font-body-sm text-[11px] text-error mt-1 leading-snug">
              3 prime movers showing burn &gt;45L/100km. Highest: <strong>KDA 542T</strong> on Eldoret escarpment.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-surface-container-low border border-[#dce9ff]">
            <span className="font-label-code text-[10px] text-amber-700 font-bold block uppercase">
              03. Voucher Audit
            </span>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
              6 claims pending (KES 142,500). 1 flagged: missing fiscal receipt at <strong>Equator Tyres</strong>.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-surface-container-low border border-[#dce9ff]">
            <span className="font-label-code text-[10px] text-primary font-bold block uppercase">
              04. Float Recon
            </span>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
              4 unlinked M-Pesa B2C disbursements in treasury float. Recommend immediate ledger match.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-surface-container-low border border-[#dce9ff]">
            <span className="font-label-code text-[10px] text-outline font-bold block uppercase">
              05. Collections
            </span>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
              2 invoices overdue &gt;15 days (Mukwano & Vivo Uganda). AR exposure: <strong>KES 820,000</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Real Ingested Financial Audit Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-emerald-300 shadow-[0_1px_12px_rgba(16,185,129,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-[14px] font-bold text-on-surface">
                BEYAYAN LIMITED • Verified Customer Financial Statements & Banking Ledger
              </span>
              <span className="font-label-code text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                REAL DOCUMENTS INGESTED
              </span>
            </div>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              Parsed from customer SWIFT pacs.008 wires and I&M Bank Kenya statement (A/C: 01306297851250). Revenue: <strong>$26,483.40</strong> from One Petroleum (U) Ltd • Cash Balance: <strong>$11,679.57</strong> (KES 1.48M).
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('financial-statements')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-body-sm text-[12px] font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto"
        >
          <span>View P&L, Balance Sheet & Ledger</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* 6 Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Card 1 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Revenue MTD
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            </div>
            <div className="font-label-numeric text-[20px] font-bold text-on-surface mt-2">
              KES 4,820,000
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Target: 4.50M</span>
            <span className="font-label-code text-tertiary font-bold">+8.4%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Direct Expenses
              </span>
              <span className="material-symbols-outlined text-amber-600 text-[18px]">receipt</span>
            </div>
            <div className="font-label-numeric text-[20px] font-bold text-on-surface mt-2">
              KES 2,410,000
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Fuel: 1.64M</span>
            <span className="font-label-code text-on-surface-variant font-medium">Allw: 420K</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Operating GP
              </span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">trending_up</span>
            </div>
            <div className="font-label-numeric text-[20px] font-bold text-tertiary mt-2">
              50.0%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">KES 2,410,000</span>
            <span className="font-label-code text-tertiary font-bold">+1.8 pts</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Cash Position
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
            </div>
            <div className="font-label-numeric text-[20px] font-bold text-on-surface mt-2">
              KES 1,840,000
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">KCB: 1.42M</span>
            <span className="font-label-code text-primary font-bold">M-PESA: 420K</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Receivables AR
              </span>
              <span className="material-symbols-outlined text-outline text-[18px]">pending</span>
            </div>
            <div className="font-label-numeric text-[20px] font-bold text-on-surface mt-2">
              KES 1,290,000
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">3 Overdue</span>
            <span className="font-label-code text-amber-700 font-bold">DSO: 34 Days</span>
          </div>
        </div>

        {/* Card 6 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Unreconciled
              </span>
              <span className="material-symbols-outlined text-error text-[18px]">rule</span>
            </div>
            <div className="font-label-numeric text-[20px] font-bold text-error mt-2">
              7 Items
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">4 M-Pesa • 3 Bank</span>
            <button
              onClick={() => onNavigate('reconciliation')}
              className="font-label-code text-primary font-bold hover:underline"
            >
              Match →
            </button>
          </div>
        </div>
      </div>

      {/* Operational Split: Attention Queue & Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Attention Queue (5 items) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">notification_important</span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                ATTENTION QUEUE ({attentionItems.length})
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={() => setClearedAttentionIds(attentionItems.map((a) => a.id))}
                className="text-outline hover:text-on-surface"
              >
                Clear Audited
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('anomalies-engine')}
                className="text-primary font-semibold hover:underline"
              >
                View Rules
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#eff4ff] flex-1">
            {attentionItems.length === 0 ? (
              <div className="p-8 text-center text-outline text-body-sm">
                All high-priority operational items and anomalies cleared!
              </div>
            ) : (
              attentionItems.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[18px] mt-0.5">
                      {item.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-[13px] font-bold text-on-surface">
                          {item.title}
                        </span>
                        <span className={`font-label-code text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={item.action}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-white font-label-code text-[11px] font-bold transition-all"
                  >
                    {item.actionText}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Cash Flow Velocity & Corridor Margin Efficiency */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cash Flow Velocity Chart Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div>
                <span className="font-headline-sm text-[14px] font-bold text-on-surface">
                  CASH FLOW & FINANCIAL VELOCITY
                </span>
                <p className="font-body-sm text-[11px] text-outline">
                  Daily Billing Pace vs Direct Haulage OPEX (Past 30 Days)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label-code text-[11px] bg-tertiary-fixed text-on-tertiary-fixed font-bold px-2 py-0.5 rounded">
                  Net Cash Margin +48.2%
                </span>
              </div>
            </div>

            {/* SVG Trend Chart */}
            <div className="py-4">
              <div className="h-44 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="600" y2="20" stroke="#eff4ff" strokeWidth="1" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#eff4ff" strokeWidth="1" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#eff4ff" strokeWidth="1" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="#eff4ff" strokeWidth="1" />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3525cd" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3525cd" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Revenue Area */}
                  <path
                    d="M 20 120 Q 120 70, 200 80 T 380 40 T 520 25 L 580 30 L 580 150 L 20 150 Z"
                    fill="url(#revenueGrad)"
                  />

                  {/* Revenue Curve */}
                  <path
                    d="M 20 120 Q 120 70, 200 80 T 380 40 T 520 25 L 580 30"
                    fill="none"
                    stroke="#3525cd"
                    strokeWidth="3"
                  />

                  {/* OPEX Dotted Curve */}
                  <path
                    d="M 20 135 Q 120 110, 200 115 T 380 90 T 520 80 L 580 82"
                    fill="none"
                    stroke="#565e74"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Data Points */}
                  <circle cx="200" cy="80" r="4" fill="#3525cd" />
                  <circle cx="380" cy="40" r="4" fill="#3525cd" />
                  <circle cx="580" cy="30" r="5" fill="#3525cd" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex items-center justify-between font-label-code text-[10px] text-outline pt-2 border-t border-[#eff4ff]">
                <span>WK 39 (KES 940K)</span>
                <span>WK 40 (KES 1.12M)</span>
                <span>WK 41 (KES 1.28M)</span>
                <span>WK 42 (KES 1.48M)</span>
                <span className="text-primary font-bold">TODAY (RUNNING)</span>
              </div>
            </div>

            {/* Velocity Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#eff4ff] text-center">
              <div>
                <span className="font-label-sm text-[10px] text-outline uppercase block">Avg Daily Billing</span>
                <span className="font-label-numeric text-[13px] font-bold text-on-surface">KES 160,700</span>
              </div>
              <div>
                <span className="font-label-sm text-[10px] text-outline uppercase block">Daily Burn Rate</span>
                <span className="font-label-numeric text-[13px] font-bold text-on-surface">KES 80,300</span>
              </div>
              <div>
                <span className="font-label-sm text-[10px] text-outline uppercase block">Net Float Retention</span>
                <span className="font-label-numeric text-[13px] font-bold text-tertiary">50.0%</span>
              </div>
            </div>
          </div>

          {/* Corridor Margin Efficiency */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-[13px] font-bold text-on-surface">
                CORRIDOR MARGIN EFFICIENCY (MTD)
              </span>
              <span className="font-label-code text-[11px] text-primary font-semibold">
                Target: &gt;45%
              </span>
            </div>

            <div className="space-y-2.5 text-[12px]">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-on-surface">Nairobi → Kampala (Northern Corridor)</span>
                  <span className="font-label-code font-bold text-tertiary">46.3% Margin</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '46.3%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline mt-0.5">
                  <span>Revenue: KES 2,140,000</span>
                  <span>OPEX: KES 1,150,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-on-surface">Mombasa Port → Kigali (Transit Haul)</span>
                  <span className="font-label-code font-bold text-tertiary">41.2% Margin</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '41.2%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline mt-0.5">
                  <span>Revenue: KES 1,820,000</span>
                  <span>OPEX: KES 1,070,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-on-surface">Eldoret Local & ICD Shunting</span>
                  <span className="font-label-code font-bold text-tertiary">52.8% Margin</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '52.8%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline mt-0.5">
                  <span>Revenue: KES 860,000</span>
                  <span>OPEX: KES 406,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Telemetry & Trip Performance Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5eeff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                FLEET TELEMETRY & TRIP PERFORMANCE
              </h2>
              <span className="font-label-code text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded font-bold">
                52 Prime Movers Total
              </span>
            </div>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              Live CANBUS telemetry feed, fuel burn ratios, trip codes and driver assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
              <input
                type="text"
                placeholder="Filter registration, driver, route..."
                value={fleetSearch}
                onChange={(e) => setFleetSearch(e.target.value)}
                className="h-8 pl-8 pr-3 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-[#dce9ff]"
              />
            </div>
            <button
              onClick={() => onNavigate('profitability')}
              className="h-8 px-3 rounded-lg bg-surface-container-low text-primary font-label-code text-[11px] font-bold hover:bg-surface-container transition-colors flex items-center gap-1 border border-[#dce9ff]"
            >
              <span>Unit P&L</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-[10px] text-outline uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-2.5 px-4">Vehicle Reg / Type</th>
                <th className="py-2.5 px-4">Assigned Driver</th>
                <th className="py-2.5 px-4">Active Trip / Corridor</th>
                <th className="py-2.5 px-4">Distance</th>
                <th className="py-2.5 px-4">Fuel Burn (L)</th>
                <th className="py-2.5 px-4">Actual vs Target km/L</th>
                <th className="py-2.5 px-4">Fuel Cost</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredVehicles.map((veh) => {
                const isAnomaly = veh.status === 'Anomaly';
                return (
                  <tr
                    key={veh.id}
                    className={`hover:bg-surface-container-low/60 transition-colors ${
                      isAnomaly ? 'bg-red-50/40' : ''
                    }`}
                  >
                    {/* Reg */}
                    <td className="py-3 px-4 font-label-code">
                      <div className="font-bold text-on-surface">{veh.reg}</div>
                      <div className="text-[10px] text-outline">{veh.makeModel}</div>
                    </td>

                    {/* Driver */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-on-surface">{veh.driver}</div>
                      <div className="font-label-code text-[10px] text-outline">{veh.driverId}</div>
                    </td>

                    {/* Corridor */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-on-surface">{veh.corridor}</div>
                      <div className="font-label-code text-[10px] text-primary">
                        {veh.tripCode} • {veh.tripLocation}
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-3 px-4 font-label-numeric font-semibold text-on-surface">
                      {veh.distanceKm > 0 ? `${veh.distanceKm} KM` : '—'}
                    </td>

                    {/* Fuel Consumed */}
                    <td className="py-3 px-4 font-label-numeric text-on-surface">
                      {veh.fuelConsumedL > 0 ? `${veh.fuelConsumedL.toFixed(1)} L` : '—'}
                    </td>

                    {/* Efficiency */}
                    <td className="py-3 px-4 font-label-numeric">
                      {veh.actualKmL > 0 ? (
                        <div>
                          <span
                            className={`font-bold ${
                              veh.efficiencyPct < 0 ? 'text-error' : 'text-tertiary'
                            }`}
                          >
                            {veh.actualKmL.toFixed(2)} km/L
                          </span>
                          <span className="text-outline text-[10px] ml-1">
                            ({veh.efficiencyPct > 0 ? `+${veh.efficiencyPct}%` : `${veh.efficiencyPct}%`})
                          </span>
                        </div>
                      ) : (
                        <span className="text-outline">—</span>
                      )}
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 font-label-numeric font-bold text-on-surface">
                      {veh.fuelCostKes > 0 ? `KES ${veh.fuelCostKes.toLocaleString()}` : '—'}
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${
                          veh.status === 'Anomaly'
                            ? 'bg-error-container text-on-error-container'
                            : veh.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-900'
                            : veh.status === 'Completed'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {veh.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {veh.status === 'Anomaly' ? (
                        <button
                          onClick={() => onNavigate('anomalies-engine')}
                          className="px-2 py-1 rounded bg-error text-white font-label-code text-[10px] font-bold hover:bg-error/90 shadow-sm"
                        >
                          Diagnose Anomaly
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('profitability')}
                          className="px-2 py-1 rounded bg-surface-container text-on-surface hover:bg-primary hover:text-white font-label-code text-[10px] transition-colors"
                        >
                          Trip Dossier
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-surface-container-low border-t border-[#e5eeff] flex items-center justify-between text-[11px] text-outline">
          <span>Showing 5 of 52 Active Fleet Assets • CANBUS IoT Gateway Online</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 bg-surface-container rounded hover:bg-surface-container-high text-on-surface">
              Previous
            </button>
            <span className="font-label-code font-bold text-on-surface">Page 1 of 11</span>
            <button className="px-2 py-1 bg-surface-container rounded hover:bg-surface-container-high text-on-surface">
              Next 5 Vehicles
            </button>
          </div>
        </div>
      </div>

      {/* Operational Health Snapshot (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">
              Nakuru Central Bulk Tank
            </span>
            <div className="font-label-numeric text-[16px] font-bold text-on-surface mt-1">
              28,450 / 40,000 L
            </div>
            <span className="text-[11px] text-tertiary font-medium">71.1% Diesel Level</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">
              Safaricom Business Float
            </span>
            <div className="font-label-numeric text-[16px] font-bold text-on-surface mt-1">
              KES 420,150
            </div>
            <span className="text-[11px] text-tertiary font-medium">Paybill 809214 • ONLINE</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">
              EAC Cross-Border Seals
            </span>
            <div className="font-label-numeric text-[16px] font-bold text-on-surface mt-1">
              18 Manifests Active
            </div>
            <span className="text-[11px] text-tertiary font-medium">100% CLEAR • Malaba / Busia</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
        </div>
      </div>
    </div>
  );
};
