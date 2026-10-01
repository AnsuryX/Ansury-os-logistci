# Ansury Logistics OS — Production Deployment & Cloud Infrastructure Guide

This guide documents the production deployment, database migration sequence, Supabase Edge Function hosting, environment secrets, and operator accounts for **Ansury Logistics OS** (Beyayan Limited).

---

## 1. Architecture & Service Topology

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend SPA** | React 19 + TypeScript + Vite | Enterprise UI, live telematics dashboards, double-entry ledgers |
| **Full-Stack Proxy** | Express (Node.js via `server.ts`) | Server-side proxy for `@google/genai` with `gemini-3.8-flash`, Vite middleware |
| **Database** | Supabase (PostgreSQL 15+) | Multi-tenant relational storage, RLS policies, immutable audit logs |
| **Edge Functions** | Supabase Edge Functions (Deno) | `ai-cfo`: Grounded financial copilot holding `GEMINI_API_KEY` server-side |
| **Authentication** | Supabase Auth + JWT | 5 RBAC operational roles, SEC-04 dual-approval trigger |
| **Port Mandate** | Port `3000` | Mandatory port for Cloud Run / reverse-proxy dev and production routing |

---

## 2. Environment Variables & Secret Provisioning

Configure the following variables in `.env` (or cloud runtime secrets panel):

```bash
# ====================================================================
# ANSURY OS RUNTIME CONFIGURATION
# ====================================================================

# Port configuration (Required: 3000)
PORT=3000

# Google Gemini AI API Key (Server-side only — never exposed to client)
GEMINI_API_KEY="AIzaSy..."

#

> **Security Mandate**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** be prefixed with `VITE_` and must **NEVER** be committed into client-facing bundles.

---

## 3. Database Migration Sequence

Execute migrations sequentially in the **Supabase SQL Editor** (`https://supabase.com/dashboard/project/<ref>/sql/new`):

### Migration 001: Base Schema (`supabase/schema.sql`)
* Provisions `vehicles` (prime movers, tanks, CANBUS odometers).
* Provisions `customers` (commercial shippers, credit days, currency).
* Provisions `company_profile` and `user_profile`.
* Provisions base `expenses` and `reconciliation_txns`.

### Migration 002: Institutional RBAC & Audit Trail (`supabase/migrations/002_auth_rls.sql`)
* Provisions `app_users` keyed to `auth.users`.
* Creates helper functions `public.has_role()` and `public.current_role()`.
* Provisions immutable `audit_logs` (strictly append-only, zero UPDATE/DELETE policies).
* Provisions `invoices` and `invoice_payments` sub-ledger.
* Installs Policy **SEC-04** trigger (`trg_sec04_no_self_approval`) preventing expense self-approvals.
* Seeds the 5 default demo personas.

### Migration 003: System Settings & Telematics Rules (`supabase/migrations/003_system_settings.sql`)
* Provisions `public.system_settings` table.
* Enforces RLS: All authenticated users can read; only `super_admin` and `finance_controller` can modify.
* Seeds master configuration (`ansury_fleet_default`):
  - `target_fuel_benchmark`: 2.40 km/L
  - `fuel_spike_threshold`: 12.50%
  - `demurrage_rate_usd`: $250.00 / day
  - `weighbridge_tolerance_pct`: 0.50%
  - `speed_limit_kmh`: 80 km/h
  - `mpesa_min_float_kes`: KES 250,000.00
  - `auto_match_swift`: true
  - `petty_cash_daily_limit_kes`: KES 100,000.00

---

## 4. Supabase Edge Function Deployment (`ai-cfo`)

The `ai-cfo` Edge Function handles grounded financial synthesis using Gemini 3.8 Flash while protecting API keys on the server.

### 4.1 Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

### 4.2 Link Project & Set Function Secrets
```bash
supabase link --project-ref qsovpdsdoycvennirfvl

supabase secrets set \
  GEMINI_API_KEY="AIzaSy..." \
  SUPABASE_URL="https://qsovpdsdoycvennirfvl.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhb..."
```

### 4.3 Deploy the Function
```bash
supabase functions deploy ai-cfo --no-verify-jwt
```

### 4.4 Verify Edge Function Endpoint
```bash
curl -i --location --request POST 'https://qsovpdsdoycvennirfvl.supabase.co/functions/v1/ai-cfo' \
  --header 'Content-Type: application/json' \
  --data '{"question":"Explain the fuel spike on KDA 542T Actros"}'
```
Expected response:
```json
{
  "answer": "[AUDIT SIGNAL] Telemetry Fuel Variance Analysis:\n• Asset: KDA 542T [Source: fleet_telematics #KDA 542T]...",
  "citations": ["fleet_telematics #KDA 542T", "system_settings #ansury_fleet_default"],
  "isGrounded": true,
  "model": "gemini-3.8-flash",
  "timestamp": "2026-09-29T08:00:00.000Z"
}
```

---

## 5. Seed Demo Accounts Matrix

The system includes 5 verified operational personas ready for testing the role matrix:

| Persona | Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Ayub Al-Ansari** | `super_admin` | `ayubalansari98@gmail.com` | `Ansury@2026!` | All modules, User Mgmt, RLS bypass override, system settings |
| **David Kimani** | `finance_controller` | `david.kimani@ansury.com` | `Ansury@2026!` | Invoices, AR, Bank Reconciliation, Expense Approvals, P&L |
| **Hassan Noor** | `fleet_ops_manager` | `hassan.noor@ansury.com` | `Ansury@2026!` | Fleet assets, driver allocation, trips dispatch, fuel telematics |
| **Faith Wanjiku** | `dispatcher_clerk` | `faith.wanjiku@ansury.com` | `Ansury@2026!` | Trips creation, waybill entry, voucher submission |
| **John Mwangi** | `driver` | `john.mwangi@ansury.com` | `Ansury@2026!` | Read-only assigned truck telematics (`KDA 542T`), voucher entry |

---

## 6. Build & Production Verification Checklist

Execute these verification checks before cutting a production release:

1. **TypeScript Type Verification**:
   ```bash
   npm run lint
   # Expected: tsc --noEmit exit code 0
   ```
2. **Production Bundle Compilation**:
   ```bash
   npm run build
   # Expected: vite build succeeds, dist/ generated
   ```
3. **Launch QC Stress-Test**:
   - Navigate to `/launch-qc`.
   - Click **Run Live Security Probes**:
     * Anon write must fail with HTTP 403 Forbidden.
     * Self-approval must be rejected by Policy SEC-04.
     * Cryptographic audit trigger must log SHA-256 stamp.
     * 9 of 9 tables must report enforced RLS.
   - Click **Export Launch Certificate** to download verified audit JSON.

---

## 7. Coolify Self-Hosted Deployment Guide

Ansury Logistics OS is pre-configured with a production-ready multi-stage `Dockerfile` and `docker-compose.yml` for seamless deployment to **Coolify** (v4+).


   ```



7. **Automatic Webhooks (Optional)**:
   - Copy the Webhook URL from Coolify into your GitHub / GitLab repository settings to trigger auto-deployments on every `git push`.
