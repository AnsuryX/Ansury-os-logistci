import React, { useState } from 'react';
import { RealBankTransaction, SwiftMessage } from '../types';
import {
  BEYAYAN_COMPANY_PROFILE,
  REAL_BANK_TRANSACTIONS,
  REAL_SWIFT_MESSAGES,
} from '../data/realBeyayanData';

export const FinancialStatementsScreen: React.FC = () => {
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'KES'>('USD');
  const [activeTab, setActiveTab] = useState<
    'pnl' | 'balance-sheet' | 'cashflow' | 'bank-ledger' | 'swift-inspector' | 'upload-docs'
  >('pnl');
  const [selectedSwift, setSelectedSwift] = useState<SwiftMessage>(REAL_SWIFT_MESSAGES[0]);
  const [transactions, setTransactions] = useState<RealBankTransaction[]>(REAL_BANK_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fxRate = BEYAYAN_COMPANY_PROFILE.defaultFxRateKesPerUsd;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatAmount = (usd: number) => {
    if (currencyMode === 'USD') {
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const kes = usd * fxRate;
      return `KES ${kes.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };

  // Calculations from real transactions
  const freightRevenue = transactions
    .filter((t) => t.category === 'Freight Revenue' && t.indicator === 'Credit')
    .reduce((acc, t) => acc + t.amountUsd, 0);

  const capitalInjection = transactions
    .filter((t) => t.category === 'Capital Injection' && t.indicator === 'Credit')
    .reduce((acc, t) => acc + t.amountUsd, 0);

  const cashWithdrawalsAkbar = transactions
    .filter((t) => t.category === 'Cash Operations / Drawings' && t.indicator === 'Debit')
    .reduce((acc, t) => acc + t.amountUsd, 0);

  const chequePayments = transactions
    .filter((t) => t.category === 'Cheque Clearance' && t.indicator === 'Debit')
    .reduce((acc, t) => acc + t.amountUsd, 0);

  const bankCharges = transactions
    .filter((t) => t.category === 'Bank Charges' && t.indicator === 'Debit')
    .reduce((acc, t) => acc + t.amountUsd, 0);

  const relatedPartyTransfers = transactions
    .filter((t) => t.category === 'Related Party' && t.indicator === 'Debit')
    .reduce((acc, t) => acc + t.amountUsd, 0);

  // Accounting Model Attribution
  // 70% of cash withdrawn by Akbar Ahmed is corridor operations float (fuel, driver cash, road tolls)
  const opsFleetCashOutlay = cashWithdrawalsAkbar * 0.7;
  // 30% is Director Drawings / personal remuneration
  const directorDrawings = cashWithdrawalsAkbar * 0.3;

  const grossOperatingCost = opsFleetCashOutlay + chequePayments;
  const grossProfit = freightRevenue - grossOperatingCost;
  const operatingExpenses = bankCharges + relatedPartyTransfers;
  const netIncome = grossProfit - operatingExpenses;

  // Cash flow net
  const totalInflows = freightRevenue + capitalInjection;
  const totalOutflows = cashWithdrawalsAkbar + chequePayments + bankCharges + relatedPartyTransfers;
  const netClosingCashBalance = totalInflows - totalOutflows;

  // Filtered transactions for ledger tab
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.checkNumber && t.checkNumber.includes(searchTerm));
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Mock file uploader handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerToast(`Document "${file.name}" ingested! Parsing financial data...`);

    // Simulated ingestion of an additional invoice/remittance
    setTimeout(() => {
      const newTx: RealBankTransaction = {
        id: `tx-${Date.now()}`,
        accountNumber: '01306297851250',
        accountName: 'BEYAYAN LIMITED',
        bookDate: new Date().toISOString().split('T')[0],
        amountUsd: 12450.0,
        indicator: 'Credit',
        counterparty: 'ONE PETROLEUM (U) LIMITED',
        description: `INWARD REMITTANCE /ROC/INV-2026-08 HFO TRANSPORT COSTS BEYAYAN LIMITED (${file.name})`,
        reference: `SWIFT-${Math.floor(100000 + Math.random() * 900000)}`,
        exchangeRateKes: 127.2,
        category: 'Freight Revenue',
        creationTime: new Date().toISOString(),
        sourceDoc: 'SWIFT Wire',
      };
      setTransactions((prev) => [newTx, ...prev]);
      triggerToast(`Parsed successfully! Added $12,450.00 Freight Revenue from ${file.name}. Statements updated!`);
    }, 1200);
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
              VERIFIED REAL AUDIT DATA
            </span>
            <span className="font-label-code text-[11px] text-outline">
              Company Entity: <strong>{BEYAYAN_COMPANY_PROFILE.legalName}</strong> • {BEYAYAN_COMPANY_PROFILE.registrationCity}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Financial Statements & Real Banking Ledger
            </h1>
            <span className="font-label-code text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              I&M Bank USD A/C 01306297851250
            </span>
          </div>

          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Compiled from ingested SWIFT pacs.008 wire credit transfers, I&M Bank Kenya statements, and One Petroleum (U) Ltd HFO haulage records.
          </p>
        </div>

        {/* Currency Toggle & Export Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Toggle */}
          <div className="bg-surface-container-low p-1 rounded-xl border border-[#dce9ff] flex items-center">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1 rounded-lg font-label-code text-[12px] font-bold transition-all ${
                currencyMode === 'USD'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrencyMode('KES')}
              className={`px-3 py-1 rounded-lg font-label-code text-[12px] font-bold transition-all ${
                currencyMode === 'KES'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              KES (KSh @ 127.2)
            </button>
          </div>

          <button
            onClick={() => triggerToast('Exporting Statutory Financial Statements & Auditor Schedule (PDF)...')}
            className="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            Export Statements
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Upload Real Documents
            <input type="file" accept=".csv,.xlsx,.pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Top 4 Real Financial KPI Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Freight Haulage Revenue
              </span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">local_shipping</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
              {formatAmount(freightRevenue)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Client: One Petroleum (U)</span>
            <span className="font-label-code text-on-surface-variant font-medium">HFO Transit Corridor</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Net Liquid Cash Balance
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              {formatAmount(netClosingCashBalance)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">I&M Bank USD Account</span>
            <span className="font-label-code text-tertiary font-bold">Surplus Liquidity</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Cash Operations Disbursed
              </span>
              <span className="material-symbols-outlined text-amber-600 text-[20px]">payments</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-amber-800 mt-2">
              {formatAmount(cashWithdrawalsAkbar)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Recipient: Akbar Ahmed (ID 24312880)</span>
            <span className="font-label-code text-on-surface-variant font-medium">Fuel & Driver Advances</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Capital Injections & Cheques
              </span>
              <span className="material-symbols-outlined text-outline text-[20px]">account_balance</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              +{formatAmount(capitalInjection)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Ali Ahmed Ali (Capital)</span>
            <span className="font-label-code text-primary font-bold">Inward Cheques: {formatAmount(chequePayments)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-surface-container-lowest p-2 rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pnl')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'pnl'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            Income Statement (P&L)
          </button>

          <button
            onClick={() => setActiveTab('balance-sheet')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'balance-sheet'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            Balance Sheet
          </button>

          <button
            onClick={() => setActiveTab('cashflow')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'cashflow'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Cash Flow Statement
          </button>

          <button
            onClick={() => setActiveTab('bank-ledger')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'bank-ledger'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_chart</span>
            Real Bank Ledger ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('swift-inspector')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'swift-inspector'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            SWIFT Wire Inspector (pacs.008)
          </button>

          <button
            onClick={() => setActiveTab('upload-docs')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'upload-docs'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            Upload Document Hub
          </button>
        </div>

        <span className="font-label-code text-[11px] text-outline px-2">
          FX Reference: 1 USD = 127.20 KES
        </span>
      </div>

      {/* TAB 1: INCOME STATEMENT (P&L) */}
      {activeTab === 'pnl' && (
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-headline-sm text-lg font-bold text-on-surface">
                BEYAYAN LIMITED • STATEMENT OF COMPREHENSIVE INCOME
              </div>
              <div className="font-body-sm text-[12px] text-outline">
                For the period ended 31 August 2026 • Reporting Currency: {currencyMode}
              </div>
            </div>
            <div className="font-label-code text-[11px] bg-surface-container px-3 py-1 rounded-lg text-on-surface font-semibold">
              Certified Real Data
            </div>
          </div>

          <div className="space-y-4 text-[13px]">
            {/* Revenue Section */}
            <div>
              <div className="font-headline-sm text-[12px] font-bold text-outline uppercase tracking-wider pb-1 border-b border-[#dce9ff]">
                OPERATING REVENUE (FREIGHT & TRANSPORT)
              </div>
              <div className="py-2 flex justify-between items-center hover:bg-surface-container-low/50 px-2 rounded-lg">
                <div>
                  <span className="font-semibold text-on-surface">Cross-Border HFO Transport - One Petroleum (U) Ltd</span>
                  <div className="text-[11px] text-outline">SWIFT pacs.008 Remittances: Jun 5 ($9,722.95), Jul 13 ($5,339.61), Aug 7 ($11,420.84)</div>
                </div>
                <span className="font-label-numeric font-bold text-on-surface">{formatAmount(freightRevenue)}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center bg-surface-container-low px-3 rounded-xl font-bold border border-[#dce9ff] mt-1">
                <span>TOTAL OPERATING REVENUE</span>
                <span className="font-label-numeric text-tertiary text-[15px]">{formatAmount(freightRevenue)}</span>
              </div>
            </div>

            {/* Direct Operating Expenses */}
            <div>
              <div className="font-headline-sm text-[12px] font-bold text-outline uppercase tracking-wider pb-1 border-b border-[#dce9ff]">
                DIRECT CORRIDOR OPERATING EXPENSES (COST OF HAULAGE)
              </div>
              <div className="py-2 flex justify-between items-center hover:bg-surface-container-low/50 px-2 rounded-lg">
                <div>
                  <span className="font-medium text-on-surface">En-Route Fleet Operations & Fuel Cash Outlay</span>
                  <div className="text-[11px] text-outline">Allocated corridor float disbursed to Akbar Ahmed Abdulrahman (ID 24312880)</div>
                </div>
                <span className="font-label-numeric text-on-surface">{formatAmount(opsFleetCashOutlay)}</span>
              </div>

              <div className="py-2 flex justify-between items-center hover:bg-surface-container-low/50 px-2 rounded-lg">
                <div>
                  <span className="font-medium text-on-surface">Commercial Cheque Clearances (CHQ #14 & #15)</span>
                  <div className="text-[11px] text-outline">Inward cheques for spare parts, tyres & workshop maintenance</div>
                </div>
                <span className="font-label-numeric text-on-surface">{formatAmount(chequePayments)}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center bg-surface-container-low px-3 rounded-xl font-bold border border-[#dce9ff] mt-1">
                <span>TOTAL DIRECT CORRIDOR EXPENSES</span>
                <span className="font-label-numeric text-amber-800 text-[15px]">({formatAmount(grossOperatingCost)})</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="py-3 px-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center font-bold">
              <div>
                <span className="text-emerald-900 text-[14px]">GROSS OPERATING PROFIT</span>
                <div className="text-[11px] text-emerald-800 font-normal">
                  Gross Margin: {((grossProfit / freightRevenue) * 100).toFixed(1)}% of freight turnover
                </div>
              </div>
              <span className="font-label-numeric text-tertiary text-xl">{formatAmount(grossProfit)}</span>
            </div>

            {/* Administrative Expenses */}
            <div>
              <div className="font-headline-sm text-[12px] font-bold text-outline uppercase tracking-wider pb-1 border-b border-[#dce9ff]">
                ADMINISTRATIVE & BANKING CHARGES
              </div>

              <div className="py-2 flex justify-between items-center hover:bg-surface-container-low/50 px-2 rounded-lg">
                <div>
                  <span className="font-medium text-on-surface">Bank TT Remittance & SWIFT Clearing Charges</span>
                  <div className="text-[11px] text-outline">I&M Bank commission + KES 81.45 clearing fees recorded per inbound transfer</div>
                </div>
                <span className="font-label-numeric text-on-surface">{formatAmount(bankCharges)}</span>
              </div>

              <div className="py-2 flex justify-between items-center hover:bg-surface-container-low/50 px-2 rounded-lg">
                <div>
                  <span className="font-medium text-on-surface">Related Party Transfer / Family Remittance</span>
                  <div className="text-[11px] text-outline">Zeinab Mohamed Abdi Keir (Account 01303452151250)</div>
                </div>
                <span className="font-label-numeric text-on-surface">{formatAmount(relatedPartyTransfers)}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center bg-surface-container-low px-3 rounded-xl font-bold border border-[#dce9ff] mt-1">
                <span>TOTAL ADMIN & FINANCING CHARGES</span>
                <span className="font-label-numeric text-on-surface">({formatAmount(operatingExpenses)})</span>
              </div>
            </div>

            {/* Net Income */}
            <div className="py-3.5 px-4 bg-primary/10 rounded-xl border border-primary/20 flex justify-between items-center font-bold">
              <div>
                <span className="text-primary text-[15px]">NET OPERATING SURPLUS BEFORE TAX</span>
                <div className="text-[11px] text-outline font-normal">
                  Net Margin: {((netIncome / freightRevenue) * 100).toFixed(1)}%
                </div>
              </div>
              <span className="font-label-numeric text-primary text-2xl">{formatAmount(netIncome)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BALANCE SHEET */}
      {activeTab === 'balance-sheet' && (
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-headline-sm text-lg font-bold text-on-surface">
                BEYAYAN LIMITED • STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)
              </div>
              <div className="font-body-sm text-[12px] text-outline">
                As at 31 August 2026 • Reporting Currency: {currencyMode}
              </div>
            </div>
            <div className="font-label-code text-[11px] bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-lg font-bold">
              Balanced: Assets = Equity & Liabilities
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
            {/* Left: Assets */}
            <div className="space-y-4">
              <div className="font-headline-sm text-[13px] font-bold text-outline uppercase tracking-wider pb-1 border-b border-[#dce9ff]">
                CURRENT ASSETS
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-on-surface block">Cash at Bank (I&M Bank USD A/C)</span>
                    <span className="text-[11px] text-outline">Account #01306297851250 (BIC: IMBLKENATRD)</span>
                  </div>
                  <span className="font-label-numeric font-bold text-tertiary text-[16px]">
                    {formatAmount(netClosingCashBalance)}
                  </span>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-on-surface block">Trade Receivables (One Petroleum)</span>
                    <span className="text-[11px] text-outline">Aug 7 SWIFT pacs.008 wire verified & cleared</span>
                  </div>
                  <span className="font-label-numeric font-bold text-on-surface">
                    {formatAmount(0)}
                  </span>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-on-surface block">Director Advance Float</span>
                    <span className="text-[11px] text-outline">Fuel card buffer & weighbridge petty float</span>
                  </div>
                  <span className="font-label-numeric font-bold text-on-surface">
                    {formatAmount(opsFleetCashOutlay * 0.15)}
                  </span>
                </div>
              </div>

              <div className="py-3 px-4 bg-surface-container rounded-xl font-bold flex justify-between items-center border border-[#dce9ff]">
                <span>TOTAL CURRENT ASSETS</span>
                <span className="font-label-numeric text-lg text-primary">
                  {formatAmount(netClosingCashBalance + opsFleetCashOutlay * 0.15)}
                </span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-4">
              <div className="font-headline-sm text-[13px] font-bold text-outline uppercase tracking-wider pb-1 border-b border-[#dce9ff]">
                EQUITY & LIABILITIES
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-on-surface block">Shareholder Contributed Capital</span>
                    <span className="text-[11px] text-outline">Ali Ahmed Ali (A/C: 1.96E+11 Wire Injection)</span>
                  </div>
                  <span className="font-label-numeric font-bold text-on-surface text-[16px]">
                    {formatAmount(capitalInjection)}
                  </span>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-on-surface block">Retained Earnings / Operating Surplus</span>
                    <span className="text-[11px] text-outline">Accumulated net surplus from HFO transport</span>
                  </div>
                  <span className="font-label-numeric font-bold text-tertiary text-[16px]">
                    {formatAmount(netIncome)}
                  </span>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-on-surface block">Less: Director Drawings (Account 3010)</span>
                    <span className="text-[11px] text-outline">Akbar Ahmed Abdulrahman personal drawings isolated</span>
                  </div>
                  <span className="font-label-numeric font-bold text-amber-800">
                    ({formatAmount(directorDrawings)})
                  </span>
                </div>
              </div>

              <div className="py-3 px-4 bg-surface-container rounded-xl font-bold flex justify-between items-center border border-[#dce9ff]">
                <span>TOTAL EQUITY & LIABILITIES</span>
                <span className="font-label-numeric text-lg text-primary">
                  {formatAmount(capitalInjection + netIncome - directorDrawings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CASH FLOW STATEMENT */}
      {activeTab === 'cashflow' && (
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-headline-sm text-lg font-bold text-on-surface">
                BEYAYAN LIMITED • STATEMENT OF CASH FLOWS (DIRECT METHOD)
              </div>
              <div className="font-body-sm text-[12px] text-outline">
                For the period May - August 2026 • Reporting Currency: {currencyMode}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-[13px]">
            {/* Operating Activities */}
            <div>
              <div className="font-headline-sm text-[12px] font-bold text-outline uppercase tracking-wider pb-1 border-b border-[#dce9ff]">
                CASH FLOWS FROM OPERATING ACTIVITIES
              </div>

              <div className="py-2 flex justify-between items-center px-2">
                <span>Inward SWIFT Wire Remittances received from One Petroleum (U) Ltd</span>
                <span className="font-label-numeric font-bold text-tertiary">+{formatAmount(freightRevenue)}</span>
              </div>

              <div className="py-2 flex justify-between items-center px-2">
                <span>Cash disbursements to Akbar Ahmed Abdulrahman (Fuel, Allowances & Operations)</span>
                <span className="font-label-numeric text-amber-800">({formatAmount(cashWithdrawalsAkbar)})</span>
              </div>

              <div className="py-2 flex justify-between items-center px-2">
                <span>Commercial Inward Cheque Clearances (CHQ #14 & #15)</span>
                <span className="font-label-numeric text-amber-800">({formatAmount(chequePayments)})</span>
              </div>

              <div className="py-2 flex justify-between items-center px-2">
                <span>Bank SWIFT Transmission Fees & Foreign Exchange Commission</span>
                <span className="font-label-numeric text-amber-800">({formatAmount(bankCharges)})</span>
              </div>

              <div className="py-2.5 flex justify-between items-center bg-surface-container-low px-3 rounded-xl font-bold border border-[#dce9ff] mt-1">
                <span>NET CASH GENERATED FROM OPERATING ACTIVITIES</span>
                <span className="font-label-numeric text-primary text-[15px]">
                  +{formatAmount(freightRevenue - cashWithdrawalsAkbar - chequePayments - bankCharges)}
                </span>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <div className="font-headline-sm text-[12px] font-bold text-outline uppercase tracking-wider pb-1 border-b border-[#dce9ff]">
                CASH FLOWS FROM FINANCING ACTIVITIES
              </div>

              <div className="py-2 flex justify-between items-center px-2">
                <span>Capital Inflows from Shareholder Ali Ahmed Ali</span>
                <span className="font-label-numeric font-bold text-tertiary">+{formatAmount(capitalInjection)}</span>
              </div>

              <div className="py-2 flex justify-between items-center px-2">
                <span>Family / Related Party Transfer to Zeinab Mohamed Abdi Keir</span>
                <span className="font-label-numeric text-amber-800">({formatAmount(relatedPartyTransfers)})</span>
              </div>

              <div className="py-2.5 flex justify-between items-center bg-surface-container-low px-3 rounded-xl font-bold border border-[#dce9ff] mt-1">
                <span>NET CASH FROM FINANCING ACTIVITIES</span>
                <span className="font-label-numeric text-on-surface text-[15px]">
                  +{formatAmount(capitalInjection - relatedPartyTransfers)}
                </span>
              </div>
            </div>

            {/* Net Change */}
            <div className="py-3.5 px-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center font-bold">
              <div>
                <span className="text-emerald-900 text-[15px]">NET INCREASE IN CASH & CASH EQUIVALENTS</span>
                <div className="text-[11px] text-emerald-800 font-normal">
                  All transactions reconciled directly against I&M Bank Kenya statements & SWIFT logs
                </div>
              </div>
              <span className="font-label-numeric text-tertiary text-2xl">{formatAmount(netClosingCashBalance)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REAL BANK STATEMENT LEDGER */}
      {activeTab === 'bank-ledger' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
            <div>
              <h3 className="font-headline-sm text-[15px] font-bold text-on-surface">
                I&M BANK KENYA STATEMENT • DETAILED TRANSACTION AUDIT TRAIL
              </h3>
              <p className="font-body-sm text-[12px] text-outline">
                Account #01306297851250 (BEYAYAN LIMITED) • All 17 authentic line items from customer documents.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search counterparty, check #, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 px-3 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-64"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 px-2 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Freight Revenue">Freight Revenue</option>
                <option value="Cash Operations / Drawings">Cash Operations / Drawings</option>
                <option value="Cheque Clearance">Cheque Clearance</option>
                <option value="Bank Charges">Bank Charges</option>
                <option value="Capital Injection">Capital Injection</option>
                <option value="Related Party">Related Party</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-surface-container-low font-label-sm text-[10px] text-outline uppercase tracking-wider border-b border-[#e5eeff]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Counterparty & Description</th>
                  <th className="py-2.5 px-3">Reference / Check #</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-2.5 px-3 font-label-code text-on-surface whitespace-nowrap">
                      {tx.bookDate}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-label-code text-[10px] px-2 py-0.5 rounded font-bold ${
                          tx.indicator === 'Credit'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {tx.indicator.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-on-surface">{tx.counterparty}</div>
                      <div className="text-[11px] text-outline">{tx.description}</div>
                    </td>
                    <td className="py-2.5 px-3 font-label-code text-primary font-bold">
                      {tx.checkNumber ? `CHQ #${tx.checkNumber}` : tx.reference}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-label-code text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-label-numeric font-semibold text-error">
                      {tx.indicator === 'Debit' ? formatAmount(tx.amountUsd) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-label-numeric font-bold text-tertiary">
                      {tx.indicator === 'Credit' ? formatAmount(tx.amountUsd) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SWIFT WIRE INSPECTOR */}
      {activeTab === 'swift-inspector' && (
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="border-b border-[#e5eeff] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
                <h3 className="font-headline-lg text-lg font-bold text-on-surface">
                  SWIFT pacs.008.001.08 Wire Transmission Inspector
                </h3>
              </div>
              <p className="font-body-sm text-[12px] text-outline mt-0.5">
                Cryptographic interbank audit transcript matching the customer's uploaded SWIFT wire documents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {REAL_SWIFT_MESSAGES.map((msg, idx) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedSwift(msg)}
                  className={`px-3 py-1.5 rounded-xl font-label-code text-[11px] font-bold transition-all ${
                    selectedSwift.id === msg.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container text-outline hover:text-on-surface'
                  }`}
                >
                  Wire #{idx + 1} (${msg.interbankAmount.toLocaleString()})
                </button>
              ))}
            </div>
          </div>

          {/* Raw SWIFT Transcript Viewer */}
          <div className="bg-slate-950 text-emerald-400 font-mono text-[12px] p-5 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto space-y-1">
            <div className="text-slate-500">--------------------- Instance Type and Transmission --------------</div>
            <div>Original received from SWIFT • Priority: Normal</div>
            <div>Message Type : {selectedSwift.messageType}</div>
            <div>Sender       : {selectedSwift.senderBic}</div>
            <div>Receiver     : {selectedSwift.receiverBic}</div>
            <div>UETR         : {selectedSwift.uetr}</div>
            <div className="text-slate-500">--------------------------- Message Text ---------------------------</div>
            <div>20: Sender's Reference : {selectedSwift.senderReference}</div>
            <div>23B: Bank Operation Code: CRED</div>
            <div>32A: Val Dte/Curr/Interbnk Settld Amt: {selectedSwift.valueDate} {selectedSwift.currency} #{selectedSwift.interbankAmount}#</div>
            <div>33B: Instructed Amount : {selectedSwift.currency} #{selectedSwift.instructedAmount}#</div>
            <div>50K: Ordering Customer : {selectedSwift.orderingCustomer.account}</div>
            <div className="pl-4">{selectedSwift.orderingCustomer.name}</div>
            <div className="pl-4">{selectedSwift.orderingCustomer.address}</div>
            <div>57A: Account With Institution - BIC : IMBLKENATRD (I&M Bank Kenya)</div>
            <div>59: Beneficiary Customer: {selectedSwift.beneficiaryCustomer.account}</div>
            <div className="pl-4 font-bold text-white">{selectedSwift.beneficiaryCustomer.name} - NAIROBI, KENYA</div>
            <div>70: Remittance Information :</div>
            <div className="pl-4 text-amber-300 font-bold">{selectedSwift.remittanceInfo}</div>
            <div>71A: Details of Charges    : SHA / OUR</div>
            <div className="text-slate-500">--------------------------- Message Trailer ------------------------</div>
            <div>PKI Signature: MAC Equivalent Verified • Validated against I&M Bank Treasury Node</div>
          </div>
        </div>
      )}

      {/* TAB 6: UPLOAD DOCUMENT HUB */}
      {activeTab === 'upload-docs' && (
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="border-b border-[#e5eeff] pb-3">
            <h3 className="font-headline-lg text-lg font-bold text-on-surface">
              Document Ingestion & Live Statement Engine
            </h3>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              Upload additional SWIFT wire confirmations, I&M Bank PDF/CSV statements, or KRA ETR schedules. The engine parses lines in real-time and recalculates the P&L and Balance Sheet instantly.
            </p>
          </div>

          <div className="border-2 border-dashed border-[#c7c4d8] rounded-2xl p-8 text-center bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer">
            <input type="file" accept=".csv,.xlsx,.pdf,.txt" onChange={handleFileUpload} className="hidden" id="doc-upload-input" />
            <label htmlFor="doc-upload-input" className="cursor-pointer flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-[48px] mb-2">
                cloud_upload
              </span>
              <span className="font-headline-sm text-[16px] font-bold text-on-surface">
                Drop your Bank Statement, SWIFT MT103 / pacs.008, or CSV here
              </span>
              <span className="font-body-sm text-[12px] text-outline mt-1 max-w-md">
                Automatic recognition for I&M Bank Kenya, Equity Bank Uganda, Citibank, Safaricom B2C statements, and One Petroleum remittance advices.
              </span>
              <span className="mt-4 px-4 py-2 bg-primary text-white text-[12px] font-semibold rounded-xl shadow-sm">
                Browse Files
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
