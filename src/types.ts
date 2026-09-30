export type NavigationPath =
  | 'overview'
  | 'trips'
  | 'vehicles-fleet'
  | 'drivers'
  | 'customers'
  | 'expenses'
  | 'reconciliation'
  | 'invoices-ar'
  | 'payments'
  | 'fuel-control'
  | 'anomalies-engine'
  | 'pl-cashflow'
  | 'profitability'
  | 'financial-statements'
  | 'ansury-ai-cfo'
  | 'launch-qc'
  | 'audit-logs'
  | 'user-management'
  | 'settings';

export interface Customer {
  id: string;
  name: string;
  tinNumber: string;
  corridor: string;
  cargoType: string;
  contactPerson: string;
  phone: string;
  email: string;
  billingCurrency: 'USD' | 'KES' | 'UGX';
  totalVolumeTonnes: number;
  totalRevenueUsd: number;
  outstandingArUsd: number;
  creditDays: number;
  activeTrips: number;
  status: 'Contract Active' | 'Pending Renewal' | 'On Hold';
  location: string;
  contractExpiry: string;
  deletedAt?: string;
  deletedReason?: string;
  actorId?: string;
}

export interface CompanyProfile {
  legalName: string;
  tradingName: string;
  registrationCity: string;
  taxPin: string;
  bankName: string;
  bankBic: string;
  accountNumber: string;
  ibanMasked: string;
  defaultCurrency: 'USD' | 'KES';
  exchangeRateKesPerUsd: number;
  hqAddress: string;
  keyDirector: string;
  directorId: string;
  keyShareholder: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  notificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
}

export interface RealBankTransaction {
  id: string;
  accountNumber: string;
  accountName: string;
  bookDate: string;
  amountUsd: number;
  indicator: 'Debit' | 'Credit';
  counterparty: string;
  description: string;
  reference: string;
  exchangeRateKes: number;
  category: 'Freight Revenue' | 'Cash Operations / Drawings' | 'Cheque Clearance' | 'Bank Charges' | 'Capital Injection' | 'Related Party' | string;
  checkNumber?: string;
  creationTime: string;
  sourceDoc: 'I&M Bank Statement' | 'SWIFT Wire' | string;
}

export interface SwiftMessage {
  id: string;
  messageType: string;
  uetr: string;
  senderBic: string;
  receiverBic: string;
  senderReference: string;
  valueDate: string;
  currency: string;
  interbankAmount: number;
  instructedAmount: number;
  orderingCustomer: {
    name: string;
    account: string;
    address: string;
  };
  beneficiaryCustomer: {
    name: string;
    account: string;
    address: string;
  };
  remittanceInfo: string;
  status: 'Received from SWIFT' | 'Settled to I&M Account' | 'Pending Reconciliation';
}

export interface Vehicle {
  id: string;
  reg: string;
  makeModel: string;
  driver: string;
  driverId: string;
  driverInitials: string;
  corridor: string;
  tripCode: string;
  tripLocation: string;
  distanceKm: number;
  fuelConsumedL: number;
  actualKmL: number;
  targetKmL: number;
  efficiencyPct: number;
  fuelCostKes: number;
  status: 'Anomaly' | 'Active' | 'Completed' | 'Maintenance';
  avatarBg?: string;
  fuelCapacityL?: number;
  odometerKm?: number;
  deletedAt?: string;
  deletedReason?: string;
  actorId?: string;
}

export interface ReconcileTransaction {
  id: string;
  rawType: 'M-PESA PAYBILL' | 'POTENTIAL DUPLICATE' | 'M-PESA P2P SEND' | 'KCB BANK RTGS' | 'EQUITY B2C';
  ref: string;
  timestamp: string;
  merchantOrParty: string;
  accountOrTarget: string;
  amountKes: number;
  confidencePct: number;
  confidenceLabel: string;
  confidenceType: 'ai' | 'flagged' | 'voucher_zero' | 'verified';
  erpTitle: string;
  erpSubtitle: string;
  erpDetails: string;
  status: 'review' | 'matched' | 'unmatched' | 'suspicious';
  deletedAt?: string;
  deletedReason?: string;
  actorId?: string;
}

export interface ExpenseClaim {
  id: string;
  claimNumber: string;
  category: string;
  amountKes: number;
  vendor: string;
  mpesaRef: string;
  truckAsset: string;
  dispatchId: string;
  route: string;
  driverName: string;
  driverId: string;
  submittedTime: string;
  submittedBy: string;
  submitterId?: string;
  approvedBy?: string;
  approvalNotes?: string;
  telemetryPass: boolean;
  telemetryNote?: string;
  varianceFlag?: boolean;
  varianceNote?: string;
  missingReceipt?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'held';
  receiptAttached?: boolean;
  receiptFileName?: string;
  receiptDataUrl?: string;
  deletedAt?: string;
  deletedReason?: string;
  actorId?: string;
}

export interface TripEconomics {
  tripId: string;
  waybill: string;
  origin: string;
  destination: string;
  customer: string;
  cargo: string;
  truckReg: string;
  truckModel: string;
  driver: string;
  distanceKm: number;
  grossRevenueKes: number;
  fuelExpenseKes: number;
  fuelLitres: number;
  fuelLocation: string;
  borderTollsKes: number;
  driverAllowanceKes: number;
  weighbridgeCessKes: number;
  accommodationKes: number;
  repairKes: number;
}

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number;
  currency: 'USD' | 'KES';
  method: 'SWIFT Wire' | 'RTGS' | 'M-PESA' | 'Cheque';
  reference: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  currency: 'USD' | 'KES';
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'refunded' | 'voided';
  corridor: string;
  waybillNumber: string;
  truckReg: string;
  cargoDescription: string;
  ratePerTonneOrLitre?: number;
  quantity?: number;
  paymentHistory: InvoicePayment[];
  deletedAt?: string;
  deletedReason?: string;
  actorId?: string;
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'finance_controller' | 'fleet_ops_manager' | 'dispatcher_clerk' | 'driver';
  phone?: string;
  location?: string;
  assignedTruck?: string;
  active: boolean;
  createdAt?: string;
  lastActive?: string;
  createdBy?: string;
}

export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'DELETE_SOFT'
  | 'RECONCILE'
  | 'APPROVE'
  | 'REJECT'
  | 'REFUND'
  | 'OVERRIDE'
  | 'LOGIN'
  | 'ROLE_CHANGE'
  | 'VOID'
  | 'VEHICLE_ADD'
  | 'CUSTOMER_CREATE'
  | 'SETTINGS_UPDATE'
  | 'RECONCILE_MATCH'
  | 'RECONCILE_REJECT'
  | 'RECONCILE_CLASSIFY'
  | 'EXPENSE_SUBMIT'
  | 'EXPENSE_APPROVE'
  | 'EXPENSE_REJECT'
  | 'EXPENSE_HOLD'
  | 'INVOICE_CREATE'
  | 'PAYMENT_RECEIVE'
  | 'USER_INVITE'
  | 'ROLE_ASSIGN'
  | 'USER_ACTIVATE'
  | 'USER_DEACTIVATE'
  | 'CUSTOMER_DELETE'
  | 'VEHICLE_DELETE'
  | 'USER_DELETE'
  | 'EXPENSE_DELETE'
  | 'EXPENSE_VOID'
  | 'TRIP_DELETE'
  | 'INVOICE_VOID';

export type AuditEntityType =
  | 'INVOICE'
  | 'INVOICE_PAYMENT'
  | 'EXPENSE'
  | 'BANK_TRANSACTION'
  | 'RECONCILIATION_TXN'
  | 'VEHICLE'
  | 'CUSTOMER'
  | 'TRIP'
  | 'USER'
  | 'FLOAT_ALLOCATION'
  | 'SYSTEM_RULE'
  | 'SETTINGS';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  ipHash: string;
}

export interface StressTestCheck {
  id: string;
  category: 'Financial' | 'Fleet' | 'Security' | 'AI' | 'Operational';
  name: string;
  description: string;
  formulaOrRule: string;
  status: 'passed' | 'failed' | 'running';
  liveProof: string;
  details?: string;
}

export interface SystemSettings {
  id: string;
  targetFuelBenchmark: number;
  fuelSpikeThreshold: number;
  demurrageRateUsd: number;
  weighbridgeTolerancePct: number;
  speedLimitKmh: number;
  nightCurfewEnabled: boolean;
  mpesaMinFloatKes: number;
  autoMatchSwift: boolean;
  pettyCashDailyLimitKes: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AnomalyIncident {
  id: string;
  title: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH AUDIT' | 'KRA COMPLIANCE' | 'WARNING';
  severityColor: string;
  timestamp: string;
  details: string;
  impact: string;
  actionText: string;
  isResolved?: boolean;
}

export interface TripDispatch {
  id: string;
  waybillNumber: string;
  route: string;
  corridor: string;
  origin: string;
  destination: string;
  shipper: string;
  cargo: string;
  cargoType: 'Liquid Bulk / Fuel' | 'Containerized' | 'Dry Bulk' | 'General Freight';
  truckReg: string;
  truckModel: string;
  driverName: string;
  driverPhone?: string;
  status: 'In Transit' | 'Customs Hold' | 'Loading / Shunting' | 'Discharging' | 'Completed' | 'Delayed';
  statusColor: string;
  progressPct: number;
  eta: string;
  grossValueKes: number;
  grossValueUsd: number;
  fuelAdvanceKes?: number;
  driverAllowanceKes?: number;
  startDate: string;
  notes?: string;
  deletedAt?: string;
  deletedReason?: string;
  actorId?: string;
}
