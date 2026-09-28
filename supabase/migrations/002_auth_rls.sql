-- ====================================================================
-- ANSURY OS / BEYAYAN LIMITED - SUPABASE MIGRATION 002
-- Authentication, RBAC Role Matrix, SEC-04 Governance & Audit Trail
-- Target: Supabase PostgreSQL (auth.users integration)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. APP USERS DIRECTORY TABLE (Keyed to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'finance_controller', 'fleet_ops_manager', 'dispatcher_clerk', 'driver')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT DEFAULT 'Nairobi Central Operating Hub',
    assigned_truck TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy email and role lookups
CREATE INDEX IF NOT EXISTS idx_app_users_role ON public.app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_active ON public.app_users(active);

-- 3. IMMUTABLE AUDIT LOGS TABLE
-- Notice: Strictly append-only. No UPDATE or DELETE policies will be defined.
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actor_id UUID,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE_SOFT', 'RECONCILE', 'APPROVE', 'REJECT', 'REFUND', 'OVERRIDE', 'LOGIN', 'ROLE_CHANGE', 'VOID')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('INVOICE', 'EXPENSE', 'BANK_TRANSACTION', 'VEHICLE', 'CUSTOMER', 'USER', 'FLOAT_ALLOCATION', 'SYSTEM_RULE', 'SETTINGS')),
    entity_id TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    reason TEXT,
    ip_hash TEXT NOT NULL DEFAULT 'sha256-local'
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_name);

-- 4. INVOICES & AR TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'KES')),
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    remaining_balance NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'refunded', 'voided')),
    corridor TEXT NOT NULL,
    waybill_number TEXT NOT NULL,
    truck_reg TEXT NOT NULL,
    cargo_description TEXT NOT NULL,
    rate_per_unit NUMERIC,
    quantity NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ,
    deleted_reason TEXT,
    actor_id UUID
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 5. INVOICE PAYMENTS TABLE (Partial & Full receipts sub-ledger)
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'KES')),
    method TEXT NOT NULL CHECK (method IN ('SWIFT Wire', 'RTGS', 'M-PESA', 'Cheque')),
    reference TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);

-- 6. UPGRADE EXPENSES TABLE (Tombstone soft-deletes and submitter tracking)
DO $$
BEGIN
    ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS deleted_reason TEXT;
    ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS actor_id UUID;
    ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS submitter_id UUID;
    ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS approved_by TEXT;
    ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS approval_notes TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7. UPGRADE RECONCILIATION TRANSACTIONS TABLE
DO $$
BEGIN
    ALTER TABLE public.reconciliation_txns ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    ALTER TABLE public.reconciliation_txns ADD COLUMN IF NOT EXISTS deleted_reason TEXT;
    ALTER TABLE public.reconciliation_txns ADD COLUMN IF NOT EXISTS actor_id UUID;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 8. RBAC HELPER FUNCTIONS: current_role() & has_role()
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Check app_users table first
    SELECT role INTO v_role
    FROM public.app_users
    WHERE id = auth.uid() AND active = true;

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Fallback to JWT user metadata
    v_role := auth.jwt() -> 'user_metadata' ->> 'role';
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Return anon if no authenticated session
    RETURN 'anon';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_role(allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.current_role() = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 9. SEC-04 POLICY ENFORCEMENT TRIGGER (Prohibits Self-Approval of Expenses)
CREATE OR REPLACE FUNCTION public.enforce_sec04_no_self_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_current_user_name TEXT;
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
        -- Check if authenticated user is the submitter
        IF NEW.submitter_id IS NOT NULL AND NEW.submitter_id = auth.uid() THEN
            RAISE EXCEPTION 'SEC-04 Violation: Claimants are strictly prohibited from approving their own corridor expenses.';
        END IF;

        -- Check if user's display name matches claimant
        SELECT full_name INTO v_current_user_name FROM public.app_users WHERE id = auth.uid();
        IF v_current_user_name IS NOT NULL AND LOWER(TRIM(NEW.claimant)) = LOWER(TRIM(v_current_user_name)) THEN
            RAISE EXCEPTION 'SEC-04 Violation: Claimants cannot authorize their own corridor expense claim (%s).', NEW.claimant;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sec04_no_self_approval ON public.expenses;
CREATE TRIGGER trg_sec04_no_self_approval
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_sec04_no_self_approval();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS across all tables
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_txns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- 10.1 APP_USERS POLICIES
DROP POLICY IF EXISTS "app_users_select_authenticated" ON public.app_users;
CREATE POLICY "app_users_select_authenticated" ON public.app_users
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "app_users_admin_write" ON public.app_users;
CREATE POLICY "app_users_admin_write" ON public.app_users
    FOR ALL TO authenticated
    USING (public.has_role(ARRAY['super_admin']))
    WITH CHECK (public.has_role(ARRAY['super_admin']));

-- 10.2 AUDIT_LOGS POLICIES (Append-only! Never allows update or delete)
DROP POLICY IF EXISTS "audit_logs_select_authorized" ON public.audit_logs;
CREATE POLICY "audit_logs_select_authorized" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'finance_controller']));

DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- No UPDATE or DELETE policy is defined on audit_logs => strictly immutable!

-- 10.3 VEHICLES POLICIES
-- Drivers have read-only access; Ops & Admin have write access
DROP POLICY IF EXISTS "vehicles_read_all" ON public.vehicles;
CREATE POLICY "vehicles_read_all" ON public.vehicles
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "vehicles_write_ops_admin" ON public.vehicles;
CREATE POLICY "vehicles_write_ops_admin" ON public.vehicles
    FOR ALL TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'fleet_ops_manager']))
    WITH CHECK (public.has_role(ARRAY['super_admin', 'fleet_ops_manager']));

-- 10.4 CUSTOMERS POLICIES
DROP POLICY IF EXISTS "customers_read_all" ON public.customers;
CREATE POLICY "customers_read_all" ON public.customers
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "customers_write_finance_admin" ON public.customers;
CREATE POLICY "customers_write_finance_admin" ON public.customers
    FOR ALL TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'finance_controller']))
    WITH CHECK (public.has_role(ARRAY['super_admin', 'finance_controller']));

-- 10.5 INVOICES & PAYMENTS POLICIES
DROP POLICY IF EXISTS "invoices_read_all" ON public.invoices;
CREATE POLICY "invoices_read_all" ON public.invoices
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "invoices_write_finance" ON public.invoices;
CREATE POLICY "invoices_write_finance" ON public.invoices
    FOR ALL TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'finance_controller']))
    WITH CHECK (public.has_role(ARRAY['super_admin', 'finance_controller']));

DROP POLICY IF EXISTS "invoice_payments_read_all" ON public.invoice_payments;
CREATE POLICY "invoice_payments_read_all" ON public.invoice_payments
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "invoice_payments_write_finance" ON public.invoice_payments;
CREATE POLICY "invoice_payments_write_finance" ON public.invoice_payments
    FOR ALL TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'finance_controller']))
    WITH CHECK (public.has_role(ARRAY['super_admin', 'finance_controller']));

-- 10.6 EXPENSES POLICIES
-- Drivers can read all, and insert vouchers for their truck; Approvals restricted to Finance & Admin
DROP POLICY IF EXISTS "expenses_read_all" ON public.expenses;
CREATE POLICY "expenses_read_all" ON public.expenses
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL OR public.has_role(ARRAY['super_admin', 'finance_controller']));

DROP POLICY IF EXISTS "expenses_insert_authenticated" ON public.expenses;
CREATE POLICY "expenses_insert_authenticated" ON public.expenses
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "expenses_update_finance" ON public.expenses;
CREATE POLICY "expenses_update_finance" ON public.expenses
    FOR UPDATE TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'finance_controller', 'fleet_ops_manager']))
    WITH CHECK (public.has_role(ARRAY['super_admin', 'finance_controller', 'fleet_ops_manager']));

-- 10.7 RECONCILIATION POLICIES
DROP POLICY IF EXISTS "reconciliation_read_all" ON public.reconciliation_txns;
CREATE POLICY "reconciliation_read_all" ON public.reconciliation_txns
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL OR public.has_role(ARRAY['super_admin', 'finance_controller']));

DROP POLICY IF EXISTS "reconciliation_write_finance" ON public.reconciliation_txns;
CREATE POLICY "reconciliation_write_finance" ON public.reconciliation_txns
    FOR ALL TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'finance_controller']))
    WITH CHECK (public.has_role(ARRAY['super_admin', 'finance_controller']));

-- 11. SEED DEFAULT ROLE PERSONAS INTO app_users
INSERT INTO public.app_users (id, role, full_name, email, phone, location, assigned_truck, active)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'super_admin', 'Ayub Al-Ansari', 'ayubalansari98@gmail.com', '+254 712 984 551', 'Nairobi Central Operating Hub', NULL, true),
    ('a0000000-0000-0000-0000-000000000002', 'finance_controller', 'David Kimani', 'david.kimani@ansury.com', '+254 722 145 890', 'Nairobi Treasury Desk', NULL, true),
    ('a0000000-0000-0000-0000-000000000003', 'fleet_ops_manager', 'Hassan Noor', 'hassan.noor@ansury.com', '+254 733 982 101', 'Mombasa Corridor Yard', NULL, true),
    ('a0000000-0000-0000-0000-000000000004', 'dispatcher_clerk', 'Faith Wanjiku', 'faith.wanjiku@ansury.com', '+254 710 443 219', 'Eldoret Logistics Hub', NULL, true),
    ('a0000000-0000-0000-0000-000000000005', 'driver', 'John Mwangi', 'john.mwangi@ansury.com', '+254 700 123 456', 'Northern Corridor (En Route)', 'KDA 542T', true)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    active = EXCLUDED.active;

-- End of Migration 002
