# Ansury Logistics OS — Agent Guidelines & System Documentation

Welcome to **Ansury Logistics OS** (Ansury Cargo Financial OS), an enterprise ERP and Financial Intelligence Platform purpose-built for East African cross-border logistics, haulage, clearing & forwarding, and fleet operations along the Northern Corridor (Mombasa – Nairobi – Malaba – Kampala – Kigali – Juba).

This document serves as the primary system manual, domain knowledge base, and developer reference for any AI agent or engineer working on this repository.

---

## 1. System Identity & Mission

* **Product Name**: Ansury Logistics OS
* **Tagline**: The Enterprise Operating System for East African Cross-Border Fleet & Corridor Finance
* **Target Audience**: Fleet Owners, Managing Directors, Chief Financial Officers, Operations Controllers, Transport Dispatchers, and Corporate Shippers.
* **Core Value**: Bridging the gap between raw transport operations (trips, waybills, fuel cards, GPS telemetry) and rigorous, audit-grade corporate accounting (P&L, Balance Sheet, Cash Flow, AR aging, I&M Bank & M-Pesa automated reconciliation).

---

## 2. Technology Stack & Architecture

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18+ (TypeScript) | Functional components, custom hooks, strict typing |
| **Bundler & Dev Server** | Vite | Configured to bind on `0.0.0.0:3000` (required by cloud proxy) |
| **Styling & Design System** | Tailwind CSS v4 | Clean enterprise typography, high-contrast light theme, responsive layouts |
| **Icons & Typography** | Google Material Symbols & Lucide React | Outlined material symbols (`<span className="material-symbols-outlined">...</span>`) |
| **Database & Persistence** | Supabase (PostgreSQL) / Resilient Fallback | Supabase client in `src/lib/supabase.ts` with local state fallback when offline |
| **Database Schema** | `supabase_schema.sql` | DDL for vehicles, customers, company profile, user profiles, invoices, payments, and audit logs |
| **Application Metadata** | `metadata.json` | Manifest tracking name, description, and major capabilities |

---

## 3. Directory & File Structure

```
.
├── AGENTS.md                          # This instructions manual for AI coding agents
├── metadata.json                      # System metadata & application capabilities
├── package.json                       # Dependencies & build scripts
├── index.html                         # HTML entry point (material symbols font loaded here)
├── vite.config.ts                     # Vite configuration
├── supabase_schema.sql                # Complete PostgreSQL DDL with RLS, indexes & schema
└── src/
    ├── main.tsx                       # React application bootstrap
    ├── App.tsx                        # Main shell, modal managers & top-level routing
    ├── index.css                      # Tailwind v4 import & custom scrollbar styles
    ├── types.ts                       # Shared TypeScript interfaces, types, and enums
    ├── data/
    │   ├── mockData.ts                # Real-world fleet, expense & banking datasets
    │   ├── mockCustomers.ts           # Customer accounts, company identity & user profile
    │   └── mockInvoices.ts            # Realistic freight invoices, payment logs & audit trail
    ├── lib/
    │   └── supabase.ts                # Supabase client initialization & upsert helpers
    └── components/
        ├── Sidebar.tsx                # Left navigation sidebar with categorized modules
        ├── Header.tsx                 # Top app bar, company quick stats, search & action buttons
        ├── DashboardScreen.tsx        # Executive summary, active fleet, corridors, cash balances
        ├── InvoicesArScreen.tsx       # Accounts Receivable lifecycle, partial payments, aging & PDF
        ├── LaunchQcScreen.tsx         # 35-point automated verification & stress-test engine
        ├── FinancialStatementsScreen.tsx # P&L, Balance Sheet, Cash Flow & Route Profitability
        ├── ReconciliationScreen.tsx   # I&M Bank statement & Safaricom M-Pesa automated match engine
        ├── ExpensesScreen.tsx         # Fuel, toll, customs vouchers & SEC-04 approval workflows
        ├── FleetScreen.tsx            # Prime movers, rigid trucks, CANBUS telemetry & specs
        ├── TripsScreen.tsx            # Waybills, dispatches, corridor transit logs & turnaround
        ├── CustomersScreen.tsx        # Shippers, credit limits, contractual rates & billing
        ├── AnomaliesScreen.tsx        # Real-time fuel spike, geofence, and idle telemetry alerts
        ├── AICfoScreen.tsx            # Ansury AI CFO Copilot with source citations & grounded math
        ├── SettingsScreen.tsx         # Tenant configuration, company PIN, BBAN & user management
        ├── CommandPaletteModal.tsx    # Cmd+K omni-search for vehicles, trips, and quick tools
        ├── QuickExpenseDrawer.tsx     # Rapid corridor expense voucher entry form
        ├── ReceiptAuditModal.tsx      # OCR inspection, tax compliance & fiscal receipt audit
        ├── ClassificationDrawer.tsx   # Manual bank txn ledger account classification
        └── ImportCsvModal.tsx         # Bank statement CSV drag-and-drop parser
```

---

## 4. Core Functional Modules

### A. Operations & Fleet Management
* **Trips & Dispatches**: Waybill numbers, origin-destination corridors, cargo types (Containerized, Dry Bulk, Wet Fuel, Transit), agreed freight rates, demurrage, and driver assignments.
* **Vehicles & Fleet**: Prime movers (e.g., Mercedes-Benz Actros 2640, Scania R450, Isuzu Giga), fuel tank capacities (e.g., 600L dual aluminum tanks), live odometer readings, service intervals, and insurance/NTSA compliance status.
* **Fuel Telemetry & Anomaly Engine**: CANBUS fuel consumption monitoring (L/100km, km/L), sudden fuel level drops, geofenced siphoning alerts, unauthorized idle stops, and driver behavioral scores.

### B. Accounting & Financial Integrity
* **Dual Currency Operations**: Full multi-currency accounting supporting **USD** and **KES** (with dynamic conversion, default: 1 USD = 132.50 KES).
* **Invoices & Accounts Receivable (AR)**:
  - Complete lifecycle: `Draft` $\to$ `Issued` $\to$ `Partially Paid` $\to$ `Paid` $\to$ `Overdue` $\to$ `Refunded`.
  - Realistic aging buckets: Current (0–30 days), 31–60 days, 61–90 days, 90+ days.
  - Partial payment handling: Multiple partial receipts reduce outstanding balance without double-counting revenue.
  - Built-in PDF printable tax invoice with KRA compliance elements.
* **Banking & M-Pesa Automated Reconciliation**:
  - Live reconciliation against **I&M Bank Kenya** statements (Account: `01306297851250`).
  - **SWIFT pacs.008 MT103** international wire ingestion for cross-border freight settlements.
  - **Safaricom M-Pesa B2C** (Paybill: `809214`) disbursement matching for driver allowances, tolls, and corridor expenses.
* **Financial Statements**:
  - **Income Statement (P&L)**: Gross Freight Revenue minus Direct Corridor Haulage (Fuel, Tolls, Customs) minus Administrative OpEx = Net Operating Surplus.
  - **Balance Sheet**: Current Assets (Bank, Liquid Float, AR) + Non-Current Assets (Fleet Equipment) = Liabilities + Shareholder Equity.
  - **Cash Flow Statement**: Direct method breaking down Operating, Investing (CapEx), and Financing cash flows.
* **Launch QC & Stress-Test Suite**:
  - 35 automated checks validating financial, fleet, security, AI, and operational integrity.
  - Interactive live sandbox for instant edge-case verification.

### C. Intelligence & Governance
* **Ansury AI CFO Copilot (Phase 4 Grounding Engine)**:
  - Financial copilot answering natural language queries regarding liquidity runway, route margins, fuel cost inflation, and tax deductions.
  - Server-side execution via Supabase Edge Function (`ai-cfo`) holding `GEMINI_API_KEY` (client never sees API key).
  - Also supported via full-stack Express server (`server.ts`) proxy route `/api/ai-cfo` with `@google/genai` (`gemini-3.8-flash`).
  - Pulls grounded context server-side (invoices, AR sub-ledger, reconciliation transactions, vehicle CANBUS telematics, vouchers).
  - Every financial claim or calculation includes source citations in square brackets (e.g. `[Source: invoices #INV-2026-0815]`, `[Source: swift_wires #S0661552C79D01USD]`).
  - If a query cannot be answered from the provided enterprise data, it returns: "Insufficient data in active enterprise ledgers to substantiate this inquiry." Data is never invented or hallucinated.
  - When Edge Function or API is offline, cleanly falls back to cached heuristics labeled: `[Cached heuristic — Edge Function offline]`.
* **Security & Dual Authorization (SEC-04)**:
  - Role-Based Access Control: `Super Administrator`, `Finance Controller`, `Fleet Operations Manager`, `Dispatcher / Clerk`, `Driver (Read-Only)`.
  - Self-approval prohibition: An expense claimant can never approve their own voucher.
* **Launch QC Security Kernel (Phase 5 Live Probes)**:
  - Security category checks are computed dynamically in real-time, not static strings.
  - Anon-key write probe: Unauthenticated writes to `audit_logs` or `app_users` fail with HTTP 403 Forbidden.
  - Self-approval probe: SEC-04 rule rejection evaluated live.
  - Cryptographic audit trigger: Evaluates append-only SHA-256 origin stamp.
  - RLS table probes: Probes 9 core tables (`vehicles`, `customers`, `invoices`, `invoice_payments`, `expenses`, `reconciliation_txns`, `audit_logs`, `app_users`, `system_settings`), returning latency in ms and policy compliance status.
* **Corridor Telemetry & Dynamic Data Integrity**:
  - Real anomaly count derived from actual vehicle telemetry and voucher compliance status. Resolving an anomaly immediately decrements the counter across the system.
  - Sidebar telemetry footer driven by live fleet data (`${activeVehiclesCount}/${totalVehiclesCount} Active`).
  - Statement CSV ingestion pipeline parses actual CSV rows and persists to `reconciliation_txns` in Supabase with immutable audit trail.
  - Fleet telematics and treasury rules persist to the `system_settings` table in Supabase.

---

## 5. Non-Negotiable Accounting Rules for AI Agents

When modifying or expanding code that touches numbers, transactions, or ledgers, you **MUST** uphold these accounting standards:

1. **Owner Capital / Equity Injection $\neq$ Revenue**:
   * Cash injections by shareholders (e.g., Ali Ahmed Ali $10,000.00) are classified under **Shareholder Equity (Account 3001)** and **Financing Cash Flows**.
   * It must **NEVER** be categorized as Freight Revenue or credited to the P&L.
2. **Loans & Borrowings $\neq$ Revenue**:
   * Debt proceeds are credited to **Liabilities (Account 2000)** and recorded under **Financing Cash Flow**.
3. **Internal Account Transfers $\neq$ Expenses**:
   * Moving money between company accounts (e.g., Bank Account $\to$ Petty Cash Float or M-Pesa Paybill) is an internal asset reallocation.
   * Both sides hit Balance Sheet asset accounts; the net P&L effect is **$0.00**.
4. **CapEx Asset Purchases $\neq$ Operating Expenses (OpEx)**:
   * Buying a truck or trailer is a capital expenditure (**CapEx**). It is debited to **Property & Equipment (Account 1500)** and depreciated over its useful life.
   * It must **NEVER** be booked directly as a period operational expense.
5. **Unpaid Invoices $\neq$ Liquid Cash**:
   * Revenue is recognized when billed (accrual accounting), but liquid cash balances only increase when a bank wire, cheque, or M-Pesa payment is confirmed and cleared.
   * Uncollected billings remain strictly in **Accounts Receivable (Account 1100)**.
6. **Immutable Audit Trail & No Silent Deletions**:
   * Financial and operational records must never be silently or permanently deleted from the database.
   * All reversals or removals require a soft-delete tombstone with an explicit audit rationale, timestamp, and actor ID.
7. **Manager Cannot Self-Approve (Policy SEC-04)**:
   * Any voucher or expense submitted by a user must be routed to an independent controller or administrator for approval.

---

## 6. Coding & Contribution Rules for AI Agents

* **TypeScript Strictness**: Always declare explicit types for props, state variables, and callback arguments. Avoid `any` types.
* **Material Symbols**: Icons should use `<span className="material-symbols-outlined ...">icon_name</span>`. Match existing design patterns.
* **Keep Port 3000**: Never change or customize the dev server port; the platform's nginx reverse proxy mandates port 3000.
* **Lint & Build Verification**:
  - Always run `lint_applet` to verify TypeScript types and syntax.
  - Always run `compile_applet` to ensure the production build succeeds before concluding any task.
* **No Unsolicited Scope Expansion**: Build exactly what the user asks for with high craftsmanship, mathematical accuracy, and refined layout. Do not introduce unrelated third-party libraries or unrequested features.

---
*Maintained by the Ansury Engineering Team for Google AI Studio Build.*
