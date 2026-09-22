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
  category: 'Freight Revenue' | 'Cash Operations / Drawings' | 'Cheque Clearance' | 'Bank Charges' | 'Capital Injection' | 'Related Party';
  checkNumber?: string;
  creationTime: string;
  sourceDoc: 'I&M Bank Statement' | 'SWIFT Wire';
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
  telemetryPass: boolean;
  telemetryNote?: string;
  varianceFlag?: boolean;
  varianceNote?: string;
  missingReceipt?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'held';
  receiptAttached?: boolean;
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
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE_SOFT' | 'RECONCILE' | 'APPROVE' | 'REJECT' | 'REFUND' | 'OVERRIDE';
  entityType: 'INVOICE' | 'EXPENSE' | 'BANK_TRANSACTION' | 'VEHICLE' | 'FLOAT_ALLOCATION' | 'SYSTEM_RULE';
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
