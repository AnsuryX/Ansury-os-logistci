import React, { useState, useEffect } from 'react';
import {
  NavigationPath,
  ReconcileTransaction,
  ExpenseClaim,
  Vehicle,
  Customer,
  CompanyProfile,
  UserProfile,
  Invoice,
  InvoicePayment,
  AuditLogEntry,
  AppUser,
  SystemSettings,
  AnomalyIncident,
  TripDispatch,
} from './types';
import {
  INITIAL_VEHICLES,
  INITIAL_RECONCILIATION_TXNS,
  INITIAL_EXPENSES,
} from './data/mockData';
import { INITIAL_TRIPS } from './data/mockTrips';
import {
  INITIAL_CUSTOMERS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_USER_PROFILE,
} from './data/mockCustomers';
import { INITIAL_INVOICES, INITIAL_AUDIT_LOGS } from './data/mockInvoices';
import { AuthProvider, useAuth, DEMO_USERS } from './lib/auth';
import { canAccessRoute, AppRole, ROLE_METADATA } from './lib/permissions';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { QuickExpenseDrawer } from './components/QuickExpenseDrawer';
import { ReceiptAuditModal } from './components/ReceiptAuditModal';
import { ClassificationDrawer } from './components/ClassificationDrawer';
import { ImportCsvModal } from './components/ImportCsvModal';
import { DashboardScreen } from './components/DashboardScreen';
import { DriverDashboardScreen } from './components/DriverDashboardScreen';
import { ReconciliationScreen } from './components/ReconciliationScreen';
import { ExpensesScreen } from './components/ExpensesScreen';
import { uniqueId } from './utils/format';
import { ProfitabilityScreen } from './components/ProfitabilityScreen';
import { TripsScreen } from './components/TripsScreen';
import { FleetScreen } from './components/FleetScreen';
import { CustomersScreen } from './components/CustomersScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AnomaliesScreen } from './components/AnomaliesScreen';
import { AICfoScreen } from './components/AICfoScreen';
import { FinancialStatementsScreen } from './components/FinancialStatementsScreen';
import { InvoicesArScreen } from './components/InvoicesArScreen';
import { LaunchQcScreen } from './components/LaunchQcScreen';
import { AuditViewerScreen } from './components/AuditViewerScreen';
import { UserManagementScreen } from './components/UserManagementScreen';
import { UserManualModal } from './components/UserManualModal';
import {
  fetchVehiclesFromSupabase,
  fetchCustomersFromSupabase,
  fetchCompanyProfileFromSupabase,
  fetchUserProfileFromSupabase,
  fetchInvoicesFromSupabase,
  fetchAuditLogsFromSupabase,
  fetchAppUsersFromSupabase,
  fetchSystemSettingsFromSupabase,
  upsertVehicleToSupabase,
  upsertCustomerToSupabase,
  upsertCompanyProfileToSupabase,
  upsertUserProfileToSupabase,
  upsertInvoiceToSupabase,
  recordInvoicePaymentToSupabase,
  logAuditEventToSupabase,
  upsertAppUserToSupabase,
  deleteVehicleFromSupabase,
  deleteCustomerFromSupabase,
  deleteAppUserFromSupabase,
  softDeleteExpenseInSupabase,
  softDeleteReconcileTxnInSupabase,
  upsertReconciliationTxnsToSupabase,
  saveSystemSettingsToSupabase,
} from './lib/supabase';

function AppShell() {
  const { user, role, permissions, isAuthenticated, isLoading } = useAuth();
  const roleMeta = ROLE_METADATA[role];

  const [currentPath, setCurrentPath] = useState<NavigationPath>('overview');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(INITIAL_COMPANY_PROFILE);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  const [reconcileTxns, setReconcileTxns] = useState<ReconcileTransaction[]>(
    INITIAL_RECONCILIATION_TXNS
  );
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(INITIAL_EXPENSES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [trips, setTrips] = useState<TripDispatch[]>(INITIAL_TRIPS);
  const [isNewTripModalRequested, setIsNewTripModalRequested] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [appUsers, setAppUsers] = useState<AppUser[]>(Object.values(DEMO_USERS));
  const [anomalies, setAnomalies] = useState<AnomalyIncident[]>([
    {
      id: 'anom-1',
      title: 'KDA 542T • Telemetry Fuel Spike (+14.2%)',
      location: 'Naivasha Escarpment → Eldoret Bypass',
      severity: 'CRITICAL',
      severityColor: 'bg-error-container text-on-error-container',
      timestamp: '2 hours ago',
      details:
        'CANBUS fuel flow meter registered 54.2 L/100km on the climb toward Mai Mahiu (+14.2% variance). Sensor logs show 3 extended idle stops.',
      impact: 'Estimated fuel excess cost: KES 8,400',
      actionText: 'Dispatch Driver Telemetry Debrief',
    },
    {
      id: 'anom-2',
      title: 'Shell Eldoret POS • Duplicate Transaction Detected',
      location: 'Paybill 247247 • Receipt QK829J25NB',
      severity: 'HIGH AUDIT',
      severityColor: 'bg-amber-100 text-amber-900',
      timestamp: 'Today 14:15 EAT',
      details:
        'Two identical charge requests of KES 18,500 were processed within a 300-second window.',
      impact: 'Risk exposure: KES 18,500 duplicate debit',
      actionText: 'Initiate Safaricom M-Pesa Reversal Request',
    },
    {
      id: 'anom-3',
      title: 'KCJ 312L • Missing Fiscal ETR Tax Receipt',
      location: 'Equator Tyres & Alignment - Nakuru Section 58',
      severity: 'KRA COMPLIANCE',
      severityColor: 'bg-purple-100 text-purple-900',
      timestamp: '3 hours ago',
      details:
        'A cash float expense of KES 48,000 was submitted without an attached KRA TIMS fiscalized receipt.',
      impact: 'Risk: Disallowance under KRA Section 23',
      actionText: 'Demand Merchant ETR Receipt',
    },
  ]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [securityToast, setSecurityToast] = useState<string | null>(null);

  // Modals & Drawers state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [receiptAuditClaim, setReceiptAuditClaim] = useState<ExpenseClaim | null>(null);
  const [classificationTxn, setClassificationTxn] = useState<ReconcileTransaction | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);

  // Guard routes based on role permissions
  useEffect(() => {
    if (!canAccessRoute(role, currentPath)) {
      setCurrentPath('overview');
      setSecurityToast(
        `Security Notice (SEC-01): Role '${roleMeta?.badgeTitle || role}' cannot access /${currentPath}. Redirected to Overview.`
      );
      setTimeout(() => setSecurityToast(null), 4500);
    }
  }, [role, currentPath, roleMeta]);

  // Auto-hydrate state from Supabase if tables exist
  useEffect(() => {
    async function loadFromCloud() {
      try {
        const [
          cloudVehicles,
          cloudCustomers,
          cloudCompany,
          cloudUser,
          cloudInvoices,
          cloudAuditLogs,
          cloudAppUsers,
          cloudSettings,
        ] = await Promise.all([
          fetchVehiclesFromSupabase(),
          fetchCustomersFromSupabase(),
          fetchCompanyProfileFromSupabase(),
          fetchUserProfileFromSupabase(),
          fetchInvoicesFromSupabase(),
          fetchAuditLogsFromSupabase(),
          fetchAppUsersFromSupabase(),
          fetchSystemSettingsFromSupabase(),
        ]);

        if (cloudVehicles && cloudVehicles.length > 0) setVehicles(cloudVehicles);
        if (cloudCustomers && cloudCustomers.length > 0) setCustomers(cloudCustomers);
        if (cloudCompany) setCompanyProfile(cloudCompany);
        if (cloudUser) setUserProfile(cloudUser);
        if (cloudInvoices && cloudInvoices.length > 0) setInvoices(cloudInvoices);
        if (cloudAuditLogs && cloudAuditLogs.length > 0) setAuditLogs(cloudAuditLogs);
        if (cloudAppUsers && cloudAppUsers.length > 0) setAppUsers(cloudAppUsers);
        if (cloudSettings) setSystemSettings(cloudSettings);
      } catch (err) {
        console.warn('Supabase auto-hydration using local fallback:', err);
      }
    }

    loadFromCloud();
  }, []);

  // Universal Audit Logger
  const handleLogAudit = async (entry: {
    action: AuditLogEntry['action'];
    entityType: AuditLogEntry['entityType'];
    entityId: string;
    previousValue?: string;
    newValue?: string;
    reason: string;
    actorName?: string;
    actorRole?: string;
  }) => {
    const newLog: AuditLogEntry = {
      id: uniqueId('log'),
      timestamp: new Date().toISOString(),
      actorName: entry.actorName || user?.fullName || 'System Operator',
      actorRole: entry.actorRole || roleMeta?.badgeTitle || role,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      reason: entry.reason,
      ipHash: `sha256-node-${Math.random().toString(36).substring(2, 8)}`,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    logAuditEventToSupabase({
      actorName: newLog.actorName,
      actorRole: newLog.actorRole,
      action: newLog.action,
      entityType: newLog.entityType,
      entityId: newLog.entityId,
      previousValue: newLog.previousValue,
      newValue: newLog.newValue,
      reason: newLog.reason,
    }).catch(() => {});
  };

  // Handlers for vehicles and customers with Supabase background sync
  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    upsertVehicleToSupabase(newVehicle).catch(() => {});
    handleLogAudit({
      action: 'VEHICLE_ADD',
      entityType: 'VEHICLE',
      entityId: newVehicle.reg,
      newValue: `${newVehicle.reg} (${newVehicle.makeModel})`,
      reason: `Fleet asset registered by ${user?.fullName || 'Operator'}`,
    });
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    upsertCustomerToSupabase(newCustomer).catch(() => {});
    handleLogAudit({
      action: 'CUSTOMER_CREATE',
      entityType: 'CUSTOMER',
      entityId: newCustomer.id,
      newValue: `${newCustomer.name} (${newCustomer.corridor} • ${newCustomer.creditDays}d terms)`,
      reason: `Customer/Shipper onboarded by ${user?.fullName || 'Operator'}`,
    });
  };

  // ==========================================
  // AUDITED DELETION & REMOVAL HANDLERS (ADMIN / CONTROLLER)
  // ==========================================
  const handleDeleteCustomer = (customerId: string, reason: string) => {
    const target = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    deleteCustomerFromSupabase(customerId).catch(() => {});
    handleLogAudit({
      action: 'CUSTOMER_DELETE',
      entityType: 'CUSTOMER',
      entityId: customerId,
      previousValue: target?.name || customerId,
      newValue: 'REMOVED_TOMBSTONE',
      reason,
    });
  };

  const handleDeleteVehicle = (regOrId: string, reason: string) => {
    const target = vehicles.find((v) => v.id === regOrId || v.reg === regOrId);
    setVehicles((prev) => prev.filter((v) => v.id !== regOrId && v.reg !== regOrId));
    deleteVehicleFromSupabase(regOrId).catch(() => {});
    handleLogAudit({
      action: 'VEHICLE_DELETE',
      entityType: 'VEHICLE',
      entityId: regOrId,
      previousValue: target ? `${target.reg} (${target.makeModel})` : regOrId,
      newValue: 'DECOMMISSIONED_TOMBSTONE',
      reason,
    });
  };

  const handleDeleteDriver = (driverIdOrName: string, reason: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.driverId === driverIdOrName || v.driver.toLowerCase() === driverIdOrName.toLowerCase()
          ? { ...v, driver: 'Unassigned', driverId: 'N/A', driverInitials: '--' }
          : v
      )
    );
    setAppUsers((prev) =>
      prev.filter(
        (u) =>
          u.id !== driverIdOrName &&
          u.fullName.toLowerCase() !== driverIdOrName.toLowerCase()
      )
    );
    deleteAppUserFromSupabase(driverIdOrName).catch(() => {});
    handleLogAudit({
      action: 'USER_DELETE',
      entityType: 'USER',
      entityId: driverIdOrName,
      newValue: 'DRIVER_ROSTER_REVOKED',
      reason,
    });
  };

  const handleDeleteUser = (userId: string, reason: string) => {
    const target = appUsers.find((u) => u.id === userId);
    setAppUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteAppUserFromSupabase(userId).catch(() => {});
    handleLogAudit({
      action: 'USER_DELETE',
      entityType: 'USER',
      entityId: userId,
      previousValue: target ? `${target.fullName} (${target.role})` : userId,
      newValue: 'USER_DELETED_TOMBSTONE',
      reason,
    });
  };

  const handleDeleteExpense = (expenseId: string, reason: string) => {
    const claim = expenses.find((e) => e.id === expenseId);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    softDeleteExpenseInSupabase(expenseId, reason, user?.id).catch(() => {});
    handleLogAudit({
      action: 'EXPENSE_VOID',
      entityType: 'EXPENSE',
      entityId: expenseId,
      previousValue: claim ? `${claim.claimNumber} - KES ${claim.amountKes.toLocaleString()}` : expenseId,
      newValue: 'VOIDED_TOMBSTONE',
      reason,
    });
  };

  const handleDeleteTrip = (tripId: string, reason: string) => {
    const target = trips.find((t) => t.id === tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    handleLogAudit({
      action: 'TRIP_DELETE',
      entityType: 'TRIP',
      entityId: tripId,
      previousValue: target ? `${target.waybillNumber} (${target.truckReg})` : tripId,
      newValue: 'CANCELLED_WAYBILL_TOMBSTONE',
      reason,
    });
  };

  const handleDeleteInvoice = (invoiceId: string, reason: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              status: 'voided' as const,
              remainingBalance: 0,
              deletedAt: new Date().toISOString(),
              deletedReason: reason,
              actorId: user?.id,
            }
          : i
      )
    );
    handleLogAudit({
      action: 'INVOICE_VOID',
      entityType: 'INVOICE',
      entityId: invoiceId,
      previousValue: target ? `${target.invoiceNumber} ($${target.totalAmount.toLocaleString()})` : invoiceId,
      newValue: 'VOIDED_CREDIT_TOMBSTONE',
      reason,
    });
  };

  const handleUpdateCompany = (newCompany: CompanyProfile) => {
    setCompanyProfile(newCompany);
    upsertCompanyProfileToSupabase(newCompany).catch(() => {});
    handleLogAudit({
      action: 'SETTINGS_UPDATE',
      entityType: 'SETTINGS',
      entityId: 'corporate_profile',
      newValue: newCompany.legalName,
      reason: 'Corporate Entity credentials and banking metadata updated',
    });
  };

  const handleUpdateUser = (newUser: UserProfile) => {
    setUserProfile(newUser);
    upsertUserProfileToSupabase(newUser).catch(() => {});
    handleLogAudit({
      action: 'SETTINGS_UPDATE',
      entityType: 'SETTINGS',
      entityId: 'user_profile',
      newValue: newUser.fullName,
      reason: 'Self-service user profile and security contact updated',
    });
  };

  // Handlers for reconciliation
  const handleConfirmMatch = (id: string) => {
    const txn = reconcileTxns.find((t) => t.id === id);
    setReconcileTxns((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'matched' as const } : t))
    );
    handleLogAudit({
      action: 'RECONCILE_MATCH',
      entityType: 'RECONCILIATION_TXN',
      entityId: id,
      newValue: 'matched',
      reason: `Matched txn ref ${txn?.ref || id} to ledger (${txn?.merchantOrParty || 'Vendor'})`,
    });
  };

  // Soft-Delete Tombstone for Reconciliation with mandatory rationale
  const handleRejectTxn = (id: string, reason?: string) => {
    const rationale = reason || 'Transaction voided and soft-deleted during bank reconciliation audit';
    const txn = reconcileTxns.find((t) => t.id === id);

    setReconcileTxns((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              deletedAt: new Date().toISOString(),
              deletedReason: rationale,
              actorId: user?.id,
              status: 'rejected' as any,
            }
          : t
      )
    );

    softDeleteReconcileTxnInSupabase(id, rationale, user?.id).catch(() => {});

    handleLogAudit({
      action: 'RECONCILE_REJECT',
      entityType: 'RECONCILIATION_TXN',
      entityId: id,
      previousValue: txn?.ref,
      newValue: 'soft_deleted_tombstone',
      reason: rationale,
    });
  };

  const handleBatchAutoMatch = () => {
    setReconcileTxns((prev) =>
      prev.map((t) =>
        t.status === 'review' ? { ...t, status: 'matched' as const } : t
      )
    );
    handleLogAudit({
      action: 'RECONCILE_MATCH',
      entityType: 'RECONCILIATION_TXN',
      entityId: 'batch_auto_match',
      newValue: 'batch_matched',
      reason: 'Automated batch match executed for high-confidence corridor transactions',
    });
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
    handleLogAudit({
      action: 'RECONCILE_CLASSIFY',
      entityType: 'RECONCILIATION_TXN',
      entityId: txnId,
      newValue: `${category} (${vehicle}) - ${memo}`,
      reason: 'Manual classification & sub-ledger assignment',
    });
  };

  // Handlers for expenses
  const handleAddExpense = (raw: Partial<ExpenseClaim>) => {
    const safeExpense: ExpenseClaim = {
      id: raw.id || uniqueId('exp'),
      claimNumber: raw.claimNumber || `EXP-2026-${uniqueId('').slice(-4)}`,
      category: raw.category || 'Corridor Fuel Advance',
      amountKes: Number(raw.amountKes) || 0,
      vendor: raw.vendor || 'Authorized Service Station',
      mpesaRef: raw.mpesaRef || `MP-${uniqueId('').slice(-8).toUpperCase()}`,
      truckAsset: raw.truckAsset || (user?.assignedTruck || 'KDA 542T'),
      dispatchId: raw.dispatchId || 'TRP-0824',
      route: raw.route || 'Mombasa - Malaba - Kampala',
      driverName: raw.driverName || user?.fullName || 'David Kimani',
      driverId: raw.driverId || 'DRV-104',
      submittedTime: raw.submittedTime || new Date().toISOString(),
      submittedBy: raw.submittedBy || user?.fullName || 'Operations Desk',
      telemetryPass: raw.telemetryPass ?? true,
      telemetryNote: raw.telemetryNote,
      varianceFlag: raw.varianceFlag ?? false,
      varianceNote: raw.varianceNote,
      missingReceipt: raw.missingReceipt ?? false,
      status: (raw.status as ExpenseClaim['status']) || 'pending',
      receiptAttached: raw.receiptAttached ?? true,
    };

    setExpenses((prev) => [safeExpense, ...prev]);

    handleLogAudit({
      action: 'EXPENSE_SUBMIT',
      entityType: 'EXPENSE',
      entityId: safeExpense.id,
      newValue: `KES ${safeExpense.amountKes.toLocaleString()} (${safeExpense.category})`,
      reason: `Voucher ${safeExpense.claimNumber} submitted by ${safeExpense.submittedBy} for truck ${safeExpense.truckAsset}`,
    });
  };

  // SEC-04: Approval check preventing self-approval
  const handleApproveExpense = (id: string) => {
    const claim = expenses.find((e) => e.id === id);

    // SEC-04 check
    if (
      user?.fullName &&
      claim &&
      (claim.submittedBy?.toLowerCase() === user.fullName.toLowerCase() ||
        claim.driverName?.toLowerCase() === user.fullName.toLowerCase())
    ) {
      setSecurityToast(
        'Policy SEC-04 Violation: Submitter cannot approve their own claim. Independent Controller required.'
      );
      setTimeout(() => setSecurityToast(null), 4500);
      return;
    }

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e))
    );

    handleLogAudit({
      action: 'EXPENSE_APPROVE',
      entityType: 'EXPENSE',
      entityId: id,
      newValue: 'approved',
      reason: `Approved claim ${claim?.claimNumber || id} (KES ${claim?.amountKes.toLocaleString() || 0}) by Controller ${user?.fullName || 'Independent Controller'}`,
    });
  };

  // Soft-Delete / Rejection Tombstone for Expenses
  const handleRejectExpense = (id: string, reason?: string) => {
    const rationale = reason || 'Disallowed under KRA Section 23 / policy SEC-04';
    const claim = expenses.find((e) => e.id === id);

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'rejected' as const,
              deletedAt: new Date().toISOString(),
              deletedReason: rationale,
              actorId: user?.id,
            }
          : e
      )
    );

    softDeleteExpenseInSupabase(id, rationale, user?.id).catch(() => {});

    handleLogAudit({
      action: 'EXPENSE_REJECT',
      entityType: 'EXPENSE',
      entityId: id,
      newValue: 'rejected',
      reason: rationale,
    });
  };

  const handleHoldExpense = (id: string) => {
    const claim = expenses.find((e) => e.id === id);
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'held' as const } : e))
    );
    handleLogAudit({
      action: 'EXPENSE_HOLD',
      entityType: 'EXPENSE',
      entityId: id,
      newValue: 'held',
      reason: `Claim ${claim?.claimNumber || id} held pending fiscal receipt verification`,
    });
  };

  // Invoices & AR CRUD Handlers
  const handleInvoicesChange = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
  };

  const handleSaveInvoice = (newInv: Invoice) => {
    upsertInvoiceToSupabase(newInv).catch(() => {});
    handleLogAudit({
      action: 'INVOICE_CREATE',
      entityType: 'INVOICE',
      entityId: newInv.id,
      newValue: `${newInv.invoiceNumber} - $${newInv.totalAmount.toLocaleString()} (${newInv.customerName})`,
      reason: `Freight tax invoice issued for waybill ${newInv.waybillNumber}`,
    });
  };

  const handleRecordInvoicePayment = (
    invoiceId: string,
    payment: InvoicePayment,
    newBalance: number,
    newStatus: string
  ) => {
    recordInvoicePaymentToSupabase(invoiceId, payment, newBalance, newStatus).catch(() => {});
    handleLogAudit({
      action: 'PAYMENT_RECEIVE',
      entityType: 'INVOICE_PAYMENT',
      entityId: payment.id,
      newValue: `${payment.currency} ${payment.amount.toLocaleString()} (${payment.method} ${payment.reference})`,
      reason: `Payment matched to invoice ${invoiceId}. Remaining balance: $${newBalance.toLocaleString()}`,
    });
  };

  // Trips & Dispatches Handlers
  const handleCreateTrip = (newTrip: TripDispatch) => {
    setTrips((prev) => [newTrip, ...prev]);
    setIsNewTripModalRequested(false);
    handleLogAudit({
      action: 'CREATE',
      entityType: 'TRIP',
      entityId: newTrip.id,
      newValue: `${newTrip.waybillNumber} - ${newTrip.route} (${newTrip.truckReg})`,
      reason: `Corridor waybill dispatch manifest issued for shipper ${newTrip.shipper}`,
    });
  };

  const handleUpdateTripStatus = (tripId: string, status: TripDispatch['status']) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status } : t))
    );
    handleLogAudit({
      action: 'UPDATE',
      entityType: 'TRIP',
      entityId: tripId,
      newValue: status,
      reason: `Corridor waybill status updated to ${status}`,
    });
  };

  // Demo Data Management & Ledger Reset
  const handlePurgeDemoData = (options: {
    invoices: boolean;
    transactions: boolean;
    expenses: boolean;
    trips: boolean;
    all: boolean;
  }) => {
    if (options.all || options.invoices) {
      setInvoices([]);
    }
    if (options.all || options.transactions) {
      setReconcileTxns([]);
    }
    if (options.all || options.expenses) {
      setExpenses([]);
    }
    if (options.all || options.trips) {
      setTrips([]);
    }
    if (options.all) {
      setAnomalies([]);
    }

    handleLogAudit({
      action: 'DELETE',
      entityType: 'RECONCILIATION_TXN',
      entityId: 'ALL_SAMPLE_DATA',
      newValue: 'PURGED_DEMO_RECORDS',
      reason: 'Purged demonstration data to initialize clean enterprise production slate.',
    });
  };

  const handleRestoreDemoData = () => {
    setInvoices(INITIAL_INVOICES);
    setReconcileTxns(INITIAL_RECONCILIATION_TXNS);
    setExpenses(INITIAL_EXPENSES);
    setTrips(INITIAL_TRIPS);
    setVehicles(INITIAL_VEHICLES);
    setCustomers(INITIAL_CUSTOMERS);

    handleLogAudit({
      action: 'CREATE',
      entityType: 'RECONCILIATION_TXN',
      entityId: 'RESTORE_SAMPLE_DATA',
      newValue: 'RESTORED_DEMO_DATA',
      reason: 'Restored realistic demonstration fleet and financial dataset.',
    });
  };

  // User Management Handlers (Admin Only)
  const handleAddUser = (newUser: AppUser) => {
    setAppUsers((prev) => [newUser, ...prev]);
    upsertAppUserToSupabase(newUser).catch(() => {});
    handleLogAudit({
      action: 'USER_INVITE',
      entityType: 'USER',
      entityId: newUser.id,
      newValue: `${newUser.fullName} <${newUser.email}> (${newUser.role})`,
      reason: `Admin invited new enterprise operator`,
    });
  };

  const handleUpdateUserRole = (userId: string, newRole: AppRole, reason: string) => {
    const target = appUsers.find((u) => u.id === userId);
    setAppUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (target) {
      upsertAppUserToSupabase({ ...target, role: newRole }).catch(() => {});
    }
    handleLogAudit({
      action: 'ROLE_ASSIGN',
      entityType: 'USER',
      entityId: userId,
      previousValue: target?.role,
      newValue: newRole,
      reason,
    });
  };

  const handleToggleUserStatus = (userId: string, active: boolean, reason: string) => {
    const target = appUsers.find((u) => u.id === userId);
    setAppUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active } : u))
    );
    if (target) {
      upsertAppUserToSupabase({ ...target, active }).catch(() => {});
    }
    handleLogAudit({
      action: active ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      entityType: 'USER',
      entityId: userId,
      newValue: active ? 'active' : 'inactive',
      reason,
    });
  };

  const handleResetUserPassword = (userId: string, tempSecret: string, reason: string) => {
    const target = appUsers.find((u) => u.id === userId);
    handleLogAudit({
      action: 'UPDATE',
      entityType: 'USER',
      entityId: userId,
      previousValue: target?.email,
      newValue: 'Temporary credential provisioned (one-time emergency token)',
      reason: `Admin reset password/PIN: ${reason}`,
    });
  };

  const handleResolveAnomaly = (id: string, title?: string) => {
    setAnomalies((prev) => prev.filter((a) => a.id !== id));
    handleLogAudit({
      action: 'SETTINGS_UPDATE',
      entityType: 'SYSTEM_RULE',
      entityId: id,
      newValue: 'resolved',
      reason: `Anomaly investigated & resolved: ${title || id}`,
    });
  };

  const handleImportTransactions = async (newTxns: ReconcileTransaction[], filename: string) => {
    if (!newTxns || newTxns.length === 0) return;
    setReconcileTxns((prev) => [...newTxns, ...prev]);
    await upsertReconciliationTxnsToSupabase(newTxns);
    handleLogAudit({
      action: 'CREATE',
      entityType: 'RECONCILIATION_TXN',
      entityId: `csv_import_${Date.now()}`,
      newValue: `${newTxns.length} transactions`,
      reason: `Imported and persisted statement feed from ${filename}`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <h2 className="font-headline-sm text-base font-bold text-on-surface">Ansury Logistics OS</h2>
        <p className="font-body-sm text-xs text-outline mt-1">
          Bootstrapping cryptographic session & corridor financial ledger...
        </p>
      </div>
    );
  }

  // Gated Route View: if not authenticated, render LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Toast */}
      {securityToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 border border-amber-500/30">
          <span className="material-symbols-outlined text-amber-400 text-[20px]">security</span>
          <span className="font-body-md text-[13px]">{securityToast}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        pendingAnomaliesCount={anomalies.length}
        activeVehiclesCount={vehicles.filter((v) => v.status === 'Active').length}
        totalVehiclesCount={vehicles.length}
        onOpenManual={() => setIsUserManualOpen(true)}
      />

      {/* Main Content Area (Offset by Sidebar width 64 = 16rem = 256px) */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigateSettings={() => setCurrentPath('settings')}
          onOpenManual={() => setIsUserManualOpen(true)}
          notificationCount={anomalies.length}
          companyName={companyProfile.legalName}
          accountNumber={companyProfile.accountNumber}
          userName={user?.fullName || userProfile.fullName}
        />

        {/* Dynamic Route View (offset by Header height 16 = 4rem = 64px) */}
        <main className="pt-16 flex-1">
          {currentPath === 'overview' && (
            role === 'driver' ? (
              <DriverDashboardScreen
                vehicles={vehicles}
                trips={trips}
                expenses={expenses}
                onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
                onNavigateToTrips={() => setCurrentPath('trips')}
              />
            ) : (
              <DashboardScreen
                vehicles={vehicles}
                onNavigate={(path) => {
                  if (path === 'trips') {
                    setIsNewTripModalRequested(true);
                  }
                  setCurrentPath(path);
                }}
                onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
                userName={user?.fullName || userProfile.fullName}
                companyName={companyProfile.legalName}
              />
            )
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
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentPath === 'profitability' && <ProfitabilityScreen />}

          {currentPath === 'trips' && (
            <TripsScreen
              trips={trips}
              vehicles={vehicles}
              customers={customers}
              onAddTrip={handleCreateTrip}
              onUpdateTripStatus={handleUpdateTripStatus}
              onDeleteTrip={handleDeleteTrip}
              initialOpenCreateModal={isNewTripModalRequested}
            />
          )}

          {currentPath === 'vehicles-fleet' && (
            <FleetScreen
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onDeleteDriver={handleDeleteDriver}
              viewMode="fleet"
            />
          )}

          {currentPath === 'drivers' && (
            <FleetScreen
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onDeleteDriver={handleDeleteDriver}
              viewMode="drivers"
            />
          )}

          {currentPath === 'fuel-control' && (
            <FleetScreen
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onDeleteDriver={handleDeleteDriver}
              viewMode="fuel"
            />
          )}

          {currentPath === 'customers' && (
            <CustomersScreen
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onNavigateToStatements={() => setCurrentPath('financial-statements')}
            />
          )}

          {currentPath === 'settings' && (
            <SettingsScreen
              companyProfile={companyProfile}
              userProfile={userProfile}
              onUpdateCompanyProfile={handleUpdateCompany}
              onUpdateUserProfile={handleUpdateUser}
              vehicles={vehicles}
              customers={customers}
              systemSettings={systemSettings || undefined}
              onUpdateSystemSettings={(st) => setSystemSettings(st)}
              invoicesCount={invoices.length}
              transactionsCount={reconcileTxns.length}
              expensesCount={expenses.length}
              tripsCount={trips.length}
              onPurgeDemoData={handlePurgeDemoData}
              onRestoreDemoData={handleRestoreDemoData}
            />
          )}

          {(currentPath === 'invoices-ar' || currentPath === 'payments') && (
            <InvoicesArScreen
              customers={customers}
              vehicles={vehicles}
              invoices={invoices}
              onInvoicesChange={handleInvoicesChange}
              onSaveInvoice={handleSaveInvoice}
              onRecordInvoicePayment={handleRecordInvoicePayment}
              onDeleteInvoice={handleDeleteInvoice}
              onNavigate={(path: NavigationPath) => setCurrentPath(path)}
            />
          )}

          {currentPath === 'launch-qc' && (
            <LaunchQcScreen
              vehicles={vehicles}
              customers={customers}
              companyProfile={companyProfile}
              userProfile={userProfile}
              onNavigate={(path: NavigationPath) => setCurrentPath(path)}
            />
          )}

          {currentPath === 'audit-logs' && (
            <AuditViewerScreen logs={auditLogs} />
          )}

          {currentPath === 'user-management' && (
            <div className="p-space-lg">
              <UserManagementScreen
                users={appUsers}
                onAddUser={handleAddUser}
                onUpdateUserRole={handleUpdateUserRole}
                onToggleUserStatus={handleToggleUserStatus}
                onResetPassword={handleResetUserPassword}
                onDeleteUser={handleDeleteUser}
                currentActorName={user?.fullName || 'Super Administrator'}
                currentActorRole={roleMeta?.badgeTitle || 'Super Administrator'}
              />
            </div>
          )}

          {(currentPath === 'financial-statements' || currentPath === 'pl-cashflow') && (
            <FinancialStatementsScreen />
          )}

          {currentPath === 'anomalies-engine' && (
            <AnomaliesScreen
              anomalies={anomalies}
              onResolveAnomaly={handleResolveAnomaly}
            />
          )}

          {currentPath === 'ansury-ai-cfo' && <AICfoScreen />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(path) => setCurrentPath(path)}
        onOpenManual={() => setIsUserManualOpen(true)}
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
        onImportTransactions={handleImportTransactions}
      />

      <UserManualModal
        isOpen={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
