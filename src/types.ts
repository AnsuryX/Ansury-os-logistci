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
  | 'ansury-ai-cfo';

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
