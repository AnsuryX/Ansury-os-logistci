# Ansury Logistics OS — Production Deployment & Cloud Infrastructure Guide

This guide documents the production deployment, database migration sequence, Supabase Edge Function hosting, environment secrets, and operator accounts for **Ansury Logistics OS** (Beyayan Limited).

---

## 1. Architecture & Service Topology

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend SPA** | React 19 + TypeScript + Vite 8 | Enterprise UI, live telematics dashboards, double-entry ledgers |
| **Full-Stack Proxy** | Express (Node.js via `server.ts`) | Server-side proxy for `@google/genai` (`gemini-3.8-flash`), serves static `dist/` |
| **Database** | Supabase (PostgreSQL 17) | Multi-tenant relational storage, RLS policies, immutable audit logs |
| **Edge Functions** | Supabase Edge Functions (Deno) | `ai-cfo`: Grounded financial copilot holding `GEMINI_API_KEY` server-side |
| **Authentication** | Supabase Auth + JWT | 5 RBAC operational roles, SEC-04 dual-approval trigger |
| **Reverse Proxy** | Traefik via Coolify (`coolify-proxy`) | Wildcard TLS for `*.ansurysystems.online` (Cloudflare Origin Cert) |
| **Port Mandate** | Port `3000` | Mandatory app port for reverse-proxy routing |

### Active Production Topology

| Item | Value |
| :--- | :--- |
| **Production URL** | `https://bayayan.ansurysystems.online` |
| **Coolify Project** | "Bayayan Logistics OS" (dedicated, per project-separation invariant) |
| **Application UUID** | `kittt0f5xaq1f7rm3pt1ahlv` |
| **Server** | Coolify VPS `161.97.85.84` |
| **Supabase Project** | **Bayayan Logistic ansari os** — ref `bngjwnzfwmiacwwomfyx` (region `ap-southeast-2`, ACTIVE) |
| **Supabase URL** | `https://bngjwnzfwmiacwwomfyx.supabase.co` |
| **Legacy project** | `qsovpdsdoycvennirfvl` — **INACTIVE / retired**; do not reference |

---

## 2. Environment Variables & Secret Provisioning

Configure the following in Coolify → Application → **Environment Variables** (and `.env` for local runs):

```bash
# ====================================================================
# ANSURY OS RUNTIME CONFIGURATION
# ====================================================================

# Port configuration (Required: 3000)
PORT=3000
NODE_ENV=production

# Supabase (publishable client values — safe for the Vite client bundle)
VITE_SUPABASE_URL=https://bngjwnzfwmiacwwomfyx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Google Gemini AI API Key (Server-side only — never exposed to client)
GEMINI_API_KEY="AIzaSy..."
```

> **Security Mandate**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** be prefixed with `VITE_` and must **NEVER** be committed into client-facing bundles. Only the two `VITE_`-prefixed publishable values are baked into the client bundle at Docker build time (via the `Dockerfile` build args).

---

## 3. Database Migration Sequence (Applied 2026-10-01)

All three migrations are **already applied** to project `bngjwnzfwmiacwwomfyx` via the Supabase Management API. Re-apply only on a fresh project, sequentially:

### Migration 001: Base Schema (`supabase/schema.sql`)
* Provisions `vehicles`, `customers`, `company_profile`, `user_profile`, `expenses`, `reconciliation_txns`.
* Permissive RLS for anon/authenticated on operational tables.
* Seeds company profile, user profile, 6 vehicles, 5 customers.

### Migration 002: Institutional RBAC & Audit Trail (`supabase/migrations/002_auth_rls.sql`)
* Provisions `app_users` keyed to `auth.users`; helper functions `public.current_role()` / `public.has_role()` (pinned `search_path=''`, EXECUTE revoked from `anon`).
* Immutable `audit_logs` (append-only: SELECT for finance/admin, INSERT for authenticated, **no UPDATE/DELETE policies**).
* Provisions `invoices` and `invoice_payments` sub-ledger.
* Installs Policy **SEC-04** trigger `trg_sec04_no_self_approval`.
* Seeds the 5 default demo personas.

### Migration 003: System Settings & Telematics Rules (`supabase/migrations/003_system_settings.sql`)
* Provisions `public.system_settings` (RLS: read all authenticated, write only super_admin/finance_controller).
* Seeds master configuration `ansury_fleet_default` (fuel benchmark 2.40 km/L, spike threshold 12.50%, demurrage $250/day, weighbridge tolerance 0.50%, speed limit 80 km/h, M-Pesa float floor KES 250,000, SWIFT auto-match on, petty cash daily cap KES 100,000).

### Migration 004: RBAC Function Hardening
* `CREATE OR REPLACE` of the three RBAC/trigger functions with `SET search_path = ''` (anti search-path-hijack for SECURITY DEFINER functions) and `REVOKE EXECUTE ... FROM anon, public` (removes PostgREST RPC exposure).

**Schema verification**: 11 tables in `public`, all with RLS enabled: `vehicles`, `customers`, `company_profile`, `user_profile`, `expenses`, `reconciliation_txns`, `app_users`, `audit_logs`, `invoices`, `invoice_payments`, `system_settings`.

---

## 4. Supabase Edge Function (`ai-cfo`) — Deployed 2026-10-01

The `ai-cfo` Edge Function (v2) is deployed and ACTIVE on `bngjwnzfwmiacwwomfyx`, and returns HTTP **503** (structured `{fallback:true}`) when `GEMINI_API_KEY` is absent — so the client cleanly fails over to the Express proxy and finally to cached heuristics.

**Failover chain**: Supabase Edge Function → Express `/api/ai-cfo` (on the Coolify container) → `[Cached heuristic — Edge Function offline]`.

**Status (2026-10-01)**: `GEMINI_API_KEY` is provisioned in the Coolify app environment, so the **Express `/api/ai-cfo` proxy serves live Gemini 3.8 Flash synthesis in production**. The Edge Function tier still needs its own secret to serve live (`GEMINI_API_KEY` is not yet in Supabase function secrets) — it currently returns the structured 503 and the client uses the Express path.

To enable live Gemini synthesis in the Edge Function itself:

```bash
npm install -g supabase
supabase login
supabase link --project-ref bngjwnzfwmiacwwomfyx
supabase secrets set GEMINI_API_KEY="AIzaSy..."
```

Verify:

```bash
curl -i -X POST 'https://bngjwnzfwmiacwwomfyx.supabase.co/functions/v1/ai-cfo' \
  --header 'Content-Type: application/json' \
  --data '{"question":"Explain the fuel spike on KDA 542T Actros"}'
```

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected into Edge Functions by the platform; only `GEMINI_API_KEY` needs manual secret provisioning.

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
3. **Launch QC Stress-Test** (navigate to `/launch-qc` in the running app):
   - Click **Run Live Security Probes**:
     * Anon write must fail (RLS rejection).
     * Self-approval must be rejected by Policy SEC-04.
     * Cryptographic audit trigger must log SHA-256 stamp.
     * 9 of 9 tables must report enforced RLS.
   - Click **Export Launch Certificate** to download verified audit JSON.

---

## 7. Coolify Self-Hosted Deployment Guide

**Coolify v4.3.23** at `http://161.97.85.84:8000` (Traefik `coolify-proxy` fronts all traffic; wildcard Cloudflare Origin Cert covers `*.ansurysystems.online`).

### Current production resource

| Field | Value |
| :--- | :--- |
| Project | **Bayayan Logistics OS** (uuid `wddbicpkro3yu90offhj0sup`) |
| Application | `bayayan-logistics-os` (uuid `kittt0f5xaq1f7rm3pt1ahlv`) |
| Source | `https://github.com/AnsuryX/Ansury-os-logistci.git` @ `main` |
| Build Pack | Dockerfile (`/Dockerfile`), port `3000`, health check `/` |
| Domain | `https://bayayan.ansurysystems.online` |

### Create / recreate a deployment (API)

```bash
# 1. Create a dedicated project
curl -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Content-Type: application/json" \
  http://161.97.85.84:8000/api/v1/projects --data '{"name":"...","description":"..."}'

# 2. Create the app (public repo source)
curl -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Content-Type: application/json" \
  http://161.97.85.84:8000/api/v1/applications/public --data '{
    "project_uuid":"<project_uuid>","server_uuid":"kgxbfynf5pobns39rtvctt5d",
    "environment_name":"production",
    "git_repository":"https://github.com/AnsuryX/Ansury-os-logistci.git","git_branch":"main",
    "build_pack":"dockerfile","dockerfile_location":"/Dockerfile","ports_exposes":"3000","name":"..."
  }'

# 3. Set the real domain (PATCH uses "domains", not "fqdn")
curl -X PATCH -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Content-Type: application/json" \
  http://161.97.85.84:8000/api/v1/applications/<uuid> --data '{"domains":"https://bayayan.ansurysystems.online"}'

# 4. Env vars: POST /applications/<uuid>/envs one var per call {key,value}; DELETE /envs/{env_uuid} to remove

# 5. Trigger deploy
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "http://161.97.85.84:8000/api/v1/deploy?uuid=<app_uuid>&force=true"
```

---

## 8. Coolify VPS Operations & Invariants

When managing services, deploying containers, or configuring domains on the Coolify VPS (161.97.85.84):

1. **Project Separation**:
   - Always create new applications or services in their own dedicated Coolify project.
   - Do not bundle independent tools into existing project folders.

2. **Traefik Reverse Proxy Network Attachment**:
   - When deploying or restarting a multi-container Docker Compose service, verify that `coolify-proxy` is attached to the service network:
     `docker network connect <service_uuid> coolify-proxy`
   - A missing network attachment causes Cloudflare 504 Gateway Timeouts.

3. **Domain Routing & SSL**:
   - Wildcard DNS (`*.ansurysystems.online`) is already active on Cloudflare.
   - The Traefik proxy already has the Cloudflare Origin Certificate for `*.ansurysystems.online`.
   - Any new subdomain can be bound directly in Coolify without adding manual DNS records in Cloudflare.

4. **Image Pull Fallbacks**:
   - If `minio/mc` fails to pull from Docker Hub, pull `quay.io/minio/mc:latest` and tag it locally:
     `docker pull quay.io/minio/mc:latest && docker tag quay.io/minio/mc:latest minio/mc && docker tag quay.io/minio/mc:latest minio/mc:latest`

5. **Safe CLI Execution on Windows**:
   - When sending SQL or complex scripts into containers over SSH from PowerShell, use stdin piping rather than nested quotation escaping:
     `"SQL_COMMAND;" | ssh root@161.97.85.84 "docker exec -i <container> psql -U ..."`

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| Cloudflare 504 on a new subdomain | Service network not attached to `coolify-proxy` | `docker network connect <service_uuid> coolify-proxy` (see §8.2) |
| Deploy fails: "New container is unhealthy" | Health probe requires `curl`/`wget` in a slim image | `node:22-slim` runtime stage installs `curl` (already in `Dockerfile`) |
| Deploy fails with ERESOLVE on `npm ci` | Peer-dep drift (`esbuild` vs Vite 8) | `package.json` pins `esbuild@^0.28.0` + `package-lock.json` committed |
| AI CFO shows `[Cached heuristic — Edge Function offline]` | `GEMINI_API_KEY` not set in Coolify env or Supabase secrets | Add key to Coolify env vars (redeploy) and/or `supabase secrets set` (§4) |
| Supabase health shows tables failing | Client pointed at retired project | All references must use `bngjwnzfwmiacwwomfyx` (§1) |

---

*Maintained by the Ansury Engineering Team.*
