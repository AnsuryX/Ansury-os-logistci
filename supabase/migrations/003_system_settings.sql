-- ====================================================================
-- ANSURY OS / BEYAYAN LIMITED - SUPABASE MIGRATION 003
-- System Settings, Fleet Telematics Rules & Treasury Parameters
-- Target: Supabase PostgreSQL (public.system_settings)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT 'ansury_fleet_default',
    target_fuel_benchmark NUMERIC(5,2) NOT NULL DEFAULT 2.40,
    fuel_spike_threshold NUMERIC(5,2) NOT NULL DEFAULT 12.50,
    demurrage_rate_usd NUMERIC(10,2) NOT NULL DEFAULT 250.00,
    weighbridge_tolerance_pct NUMERIC(5,2) NOT NULL DEFAULT 0.50,
    speed_limit_kmh INTEGER NOT NULL DEFAULT 80,
    night_curfew_enabled BOOLEAN NOT NULL DEFAULT true,
    mpesa_min_float_kes NUMERIC(12,2) NOT NULL DEFAULT 250000.00,
    auto_match_swift BOOLEAN NOT NULL DEFAULT true,
    petty_cash_daily_limit_kes NUMERIC(12,2) NOT NULL DEFAULT 100000.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by TEXT DEFAULT 'Super Administrator'
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 1. Read access for all authenticated users
DROP POLICY IF EXISTS "system_settings_read_all" ON public.system_settings;
CREATE POLICY "system_settings_read_all" ON public.system_settings
    FOR SELECT TO authenticated
    USING (true);

-- 2. Mutation access strictly restricted to Super Admin & Finance Controller
DROP POLICY IF EXISTS "system_settings_write_authorized" ON public.system_settings;
CREATE POLICY "system_settings_write_authorized" ON public.system_settings
    FOR ALL TO authenticated
    USING (public.has_role(ARRAY['super_admin', 'finance_controller']))
    WITH CHECK (public.has_role(ARRAY['super_admin', 'finance_controller']));

-- 3. Seed Default Master Configuration
INSERT INTO public.system_settings (
    id,
    target_fuel_benchmark,
    fuel_spike_threshold,
    demurrage_rate_usd,
    weighbridge_tolerance_pct,
    speed_limit_kmh,
    night_curfew_enabled,
    mpesa_min_float_kes,
    auto_match_swift,
    petty_cash_daily_limit_kes,
    updated_by
) VALUES (
    'ansury_fleet_default',
    2.40,
    12.50,
    250.00,
    0.50,
    80,
    true,
    250000.00,
    true,
    100000.00,
    'System Bootstrap'
)
ON CONFLICT (id) DO NOTHING;
