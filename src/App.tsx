import React, { useState } from 'react';
import { NavigationPath, ReconcileTransaction, ExpenseClaim } from './types';
import {
  INITIAL_VEHICLES,
  INITIAL_RECONCILIATION_TXNS,
  INITIAL_EXPENSES,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { QuickExpenseDrawer } from './components/QuickExpenseDrawer';
import { ReceiptAuditModal } from './components/ReceiptAuditModal';
import { ClassificationDrawer } from './components/ClassificationDrawer';
import { ImportCsvModal } from './components/ImportCsvModal';
import { DashboardScreen } from './components/DashboardScreen';
import { ReconciliationScreen } from './components/ReconciliationScreen';
import { ExpensesScreen } from './components/ExpensesScreen';
import { ProfitabilityScreen } from './components/ProfitabilityScreen';
import { TripsScreen } from './components/TripsScreen';
import { FleetScreen } from './components/FleetScreen';
import { AnomaliesScreen } from './components/AnomaliesScreen';
import { AICfoScreen } from './components/AICfoScreen';
import { FinancialStatementsScreen } from './components/FinancialStatementsScreen';

export function App() {
  const [currentPath, setCurrentPath] = useState<NavigationPath>('overview');
  const [vehicles] = useState(INITIAL_VEHICLES);
  const [reconcileTxns, setReconcileTxns] = useState<ReconcileTransaction[]>(
    INITIAL_RECONCILIATION_TXNS
  );
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(INITIAL_EXPENSES);
  const [anomaliesCount, setAnomaliesCount] = useState(3);

  // Modals & Drawers state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [receiptAuditClaim, setReceiptAuditClaim] = useState<ExpenseClaim | null>(null);
  const [classificationTxn, setClassificationTxn] = useState<ReconcileTransaction | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Handlers for reconciliation
  const handleConfirmMatch = (id: string) => {
    setReconcileTxns((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'matched' as const } : t))
    );
  };

  const handleRejectTxn = (id: string) => {
    setReconcileTxns((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBatchAutoMatch = () => {
    setReconcileTxns((prev) =>
      prev.map((t) =>
        t.status === 'review' ? { ...t, status: 'matched' as const } : t
      )
    );
  };

  const handleSaveClassification = (
    txnId: string,
    category: string,
    vehicle: string,
    memo: string
  ) => {
    setReconcileTxns((prev) =>
      prev.map((t) =>
        t.id === txnId
          ? {
              ...t,
              status: 'matched' as const,
              erpTitle: `${category} (${vehicle})`,
              erpSubtitle: memo,
              confidenceType: 'verified' as const,
            }
          : t
      )
    );
  };

  // Handlers for expenses
  const handleAddExpense = (newExpense: Partial<ExpenseClaim>) => {
    setExpenses((prev) => [newExpense as ExpenseClaim, ...prev]);
  };

  const handleApproveExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e))
    );
  };

  const handleRejectExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'rejected' as const } : e))
    );
  };

  const handleHoldExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'held' as const } : e))
    );
  };

  const handleResolveAnomaly = () => {
    setAnomaliesCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        pendingAnomaliesCount={anomaliesCount}
      />

      {/* Main Content Area (Offset by Sidebar width 64 = 16rem = 256px) */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          notificationCount={anomaliesCount}
        />

        {/* Dynamic Route View (offset by Header height 16 = 4rem = 64px) */}
        <main className="pt-16 flex-1">
          {currentPath === 'overview' && (
            <DashboardScreen
              vehicles={vehicles}
              onNavigate={(path) => setCurrentPath(path)}
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            />
          )}

          {currentPath === 'reconciliation' && (
            <ReconciliationScreen
              transactions={reconcileTxns}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenClassifierDrawer={(txn) => setClassificationTxn(txn)}
              onConfirmMatch={handleConfirmMatch}
              onRejectTxn={handleRejectTxn}
              onBatchAutoMatch={handleBatchAutoMatch}
            />
          )}

          {currentPath === 'expenses' && (
            <ExpensesScreen
              expenses={expenses}
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
              onOpenReceiptAudit={(claim) => setReceiptAuditClaim(claim)}
              onApproveExpense={handleApproveExpense}
              onRejectExpense={handleRejectExpense}
              onHoldExpense={handleHoldExpense}
            />
          )}

          {currentPath === 'profitability' && <ProfitabilityScreen />}

          {currentPath === 'trips' && <TripsScreen />}

          {(currentPath === 'vehicles-fleet' ||
            currentPath === 'drivers' ||
            currentPath === 'customers' ||
            currentPath === 'fuel-control') && <FleetScreen vehicles={vehicles} />}

          {(currentPath === 'invoices-ar' || currentPath === 'payments') && (
            <ProfitabilityScreen />
          )}

          {(currentPath === 'financial-statements' || currentPath === 'pl-cashflow') && (
            <FinancialStatementsScreen />
          )}

          {currentPath === 'anomalies-engine' && (
            <AnomaliesScreen onResolveAnomaly={handleResolveAnomaly} />
          )}

          {currentPath === 'ansury-ai-cfo' && <AICfoScreen />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(path) => setCurrentPath(path)}
      />

      <QuickExpenseDrawer
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onSubmit={handleAddExpense}
      />

      <ReceiptAuditModal
        claim={receiptAuditClaim}
        isOpen={!!receiptAuditClaim}
        onClose={() => setReceiptAuditClaim(null)}
        onApprove={handleApproveExpense}
        onReject={handleRejectExpense}
      />

      <ClassificationDrawer
        transaction={classificationTxn}
        isOpen={!!classificationTxn}
        onClose={() => setClassificationTxn(null)}
        onSave={handleSaveClassification}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(count) => {
          // add sample matched records
        }}
      />
    </div>
  );
}

export default App;
