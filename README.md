# Ansury Logistics OS — Enterprise Freight & Corridor Finance Platform

> The Enterprise Operating System for East African Cross-Border Fleet, Haulage & Corridor Finance.

---

## 1. Executive Summary

**Ansury Logistics OS** bridges raw transport operations along the Northern Corridor (**Mombasa – Nairobi – Malaba – Kampala – Kigali – Juba**) with audit-grade corporate financial accounting.

It unifies:
* **Real-time Transit Manifests & Waybills**: Waybill tracking, OSBP customs clearance holds (Malaba, Busia, Katuna), and automated turnaround dockets.
* **Audit-Grade Double-Entry Finance**: Real-time statutory Balance Sheet, Income Statement (P&L), and Direct Cash Flow statement.
* **Real Document Ingestion Engine**: Zero-simulation parser for bank CSV statements, SWIFT MT103/pacs.008 credit wires, and KRA ETR schedules.
* **1-Click Verified CSV Exports**: Real tabular data downloads across all 6 financial and operational screens.
* **Enterprise Ledger Reset & Demo Data Purge**: Clear sample data with one click to initialize a 100% clean production ledger.
* **Institutional Governance (SEC-04)**: Strict separation of powers preventing self-approval of financial disbursements.

---

## 2. Core Functional Capabilities

### A. Operations & Waybill Dispatches
* **Dispatch Manifest Creation**: Interactive modal to issue corridor manifests specifying Shipper, Origin, Destination, Corridor, Cargo classification (Liquid Bulk, Containerized, Dry Bulk, General Freight), Prime Mover, Driver, Agreed Freight Rate, and Fuel Advance.
* **Waybill Docket Inspector**: Real printable transit waybill document with carrier PIN, consignor details, customs seal instructions, and driver signature line.
* **Status Transitions**: Advance dispatches from `Loading` $\to$ `In Transit` $\to$ `Customs Hold` $\to$ `Discharging` $\to$ `Completed`.
* **Export Dispatches**: Downloads `Ansury_Corridor_Trips_Manifests.csv` containing all transit manifests.

### B. Document Ingestion & Financial Parser (Real, Zero-Simulation)
* **Multi-Format Ingestion**: Ingests `.csv`, `.txt`, `.json`, and raw banking transcripts.
* **Header & Column Auto-Detection**: Dynamically maps Date, Description/Narration, Debit/Credit Outflows, References, and Counterparties regardless of column ordering.
* **SWIFT MT103 / pacs.008 Tag Parser**: Extracts transaction references (`:20:`), value dates and currency amounts (`:32A:`), ordering customers (`:50K:`), and remittance details (`:70:`).
* **Live Statement Recalculation**: Ingested lines are immediately appended to active ledgers, recalculating Freight Revenue, Net Operating Surplus, and Cash at Bank truthfully without hardcoded mock amounts.

### C. 1-Click Production CSV Exports
Every module features real, browser-triggered CSV downloads:
1. **Financial Statements**: Downloads `Ansury_Financial_Statements_YYYY-MM-DD.csv` with statutory Income Statement (P&L), Balance Sheet, and bank ledger transcript.
2. **Trip & Vehicle Profitability**: Downloads `Ansury_Corridor_Vehicle_Profitability_Ledger_YYYY-MM-DD.csv` with per-truck fuel consumption, border tolls, maintenance, and net margin yield.
3. **Bank & M-Pesa Reconciliation**: Downloads `Ansury_Bank_Mpesa_Reconciliation_Ledger_YYYY-MM-DD.csv` with channel types, references, confidence gauges, and ERP matching records.
4. **Expenses & KRA Tax Vouchers**: Downloads `Ansury_KRA_Section23_Expense_Schedule_YYYY-MM-DD.csv` with 16% VAT breakdowns, vendor PINs, and CANBUS odometer telemetry checks.
5. **Invoices & Accounts Receivable (AR)**: Downloads `Ansury_Invoices_AR_Ledger_YYYY-MM-DD.csv` with customer contracts, aging, paid amounts, and remaining balances.
6. **Trips & Dispatches**: Downloads `Ansury_Corridor_Trips_Manifests_YYYY-MM-DD.csv` with transit routes, shippers, and agreed freight values.

### D. Demo Data Management & Clean Slate Reset
* **Purge Sample Data**: Accessible via `Settings` $\to$ `Purge Demo Data / Reset Slate` or via `Cmd+K` Omni-Search.
* **Selective Purge Options**:
  * Invoices & Accounts Receivable (resets AR to $0.00).
  * Bank & M-Pesa Reconciliation Worktable.
  * Expense Claims & Corridor Vouchers.
  * Trips & Dispatches Manifests.
* **One-Click Restore**: Easily reloads the realistic demonstration corridor dataset for testing or demonstrations.
* **Audit Trail Accountability**: Every purge and restore event logs an immutable audit trail entry (`DEMO_DATA_PURGED` / `RESTORE_SAMPLE_DATA`).

### E. Financial Integrity Rules (Non-Negotiable)
1. **Owner Capital $\neq$ Freight Revenue**: Equity injections are credited to Account 3001 and Financing Cash Flows, never to P&L.
2. **Borrowings $\neq$ Revenue**: Debt proceeds are booked to Liabilities (Account 2000).
3. **Internal Transfers $\neq$ Expenses**: Moving funds between Bank and M-Pesa float has a net P&L effect of $0.00.
4. **CapEx Purchases $\neq$ OpEx**: Asset purchases (trucks/trailers) are capitalized to Property & Equipment (Account 1500) on the Balance Sheet.
5. **Policy SEC-04**: An expense claimant can never approve their own voucher.

---

## 3. Technology Stack

* **Frontend**: React 18+ (TypeScript), Tailwind CSS v4, Google Material Symbols.
* **Database & Persistence**: Supabase (PostgreSQL) with Row-Level Security (RLS) policies and local state fallback.
* **AI Copilot**: Ansury AI CFO powered by `@google/genai` with server-side proxy route and strict ledger citations.
* **File Handling**: Native `FileReader` with RFC-4180 compliant CSV parsing and Blob URL downloads.

---

## 4. Verification & Testing

Verify system integrity with:
```bash
# Run strict TypeScript compiler verification
npm run lint

# Build production bundle
npm run build
```

---
*Built for East African hauliers, fuel tanker operators, and corporate shippers.*
