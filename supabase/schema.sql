-- ====================================================================
-- ANSURY OS / BEYAYAN LIMITED - SUPABASE ENTERPRISE DATABASE SCHEMA
-- Project: qsovpdsdoycvennirfvl
-- Generated: 2026-09-22
-- ====================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. VEHICLES & PRIME MOVERS TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY,
    reg TEXT NOT NULL UNIQUE,
    make_model TEXT NOT NULL,
    driver TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    driver_initials TEXT NOT NULL,
    corridor TEXT NOT NULL,
    trip_code TEXT NOT NULL,
    trip_location TEXT NOT NULL,
    distance_km NUMERIC NOT NULL DEFAULT 0,
    fuel_consumed_l NUMERIC NOT NULL DEFAULT 0,
    actual_km_l NUMERIC NOT NULL DEFAULT 2.4,
    target_km_l NUMERIC NOT NULL DEFAULT 2.4,
    efficiency_pct NUMERIC NOT NULL DEFAULT 0,
    fuel_cost_kes NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Completed', 'Anomaly')),
    avatar_bg TEXT NOT NULL DEFAULT 'bg-primary',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CUSTOMERS & COMMERCIAL SHIPPERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    tin_number TEXT,
    corridor TEXT NOT NULL,
    cargo_type TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    billing_currency TEXT NOT NULL DEFAULT 'USD' CHECK (billing_currency IN ('USD', 'KES', 'UGX')),
    total_volume_tonnes NUMERIC NOT NULL DEFAULT 0,
    total_revenue_usd NUMERIC NOT NULL DEFAULT 0,
    outstanding_ar_usd NUMERIC NOT NULL DEFAULT 0,
    credit_days INTEGER NOT NULL DEFAULT 15,
    active_trips INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Contract Active' CHECK (status IN ('Contract Active', 'Pending Renewal', 'On Hold')),
    location TEXT NOT NULL,
    contract_expiry TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. COMPANY ENTITY & BANK PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.company_profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    legal_name TEXT NOT NULL DEFAULT 'BEYAYAN LIMITED',
    trading_name TEXT NOT NULL DEFAULT 'Beyayan Petroleum & Logistics',
    registration_city TEXT NOT NULL DEFAULT 'Nairobi, Kenya',
    tax_pin TEXT NOT NULL DEFAULT 'P051394821Z',
    bank_name TEXT NOT NULL DEFAULT 'I&M Bank Kenya',
    bank_bic TEXT NOT NULL DEFAULT 'IMBLKENATRD',
    account_number TEXT NOT NULL DEFAULT '01306297851250',
    iban_masked TEXT NOT NULL DEFAULT '1.31E+12 (Masked IBAN)',
    default_currency TEXT NOT NULL DEFAULT 'USD' CHECK (default_currency IN ('USD', 'KES')),
    exchange_rate_kes_per_usd NUMERIC NOT NULL DEFAULT 127.20,
    hq_address TEXT NOT NULL DEFAULT 'Industrial Area, Enterprise Road, Nairobi, Kenya',
    key_director TEXT NOT NULL DEFAULT 'Akbar Ahmed Abdulrahman',
    director_id TEXT NOT NULL DEFAULT '24312880',
    key_shareholder TEXT NOT NULL DEFAULT 'Ali Ahmed Ali',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. USER PROFILE & DISPATCH CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS public.user_profile (
    id TEXT PRIMARY KEY DEFAULT 'current',
    full_name TEXT NOT NULL DEFAULT 'David Kimani',
    email TEXT NOT NULL DEFAULT 'ayubalansari98@gmail.com',
    role TEXT NOT NULL DEFAULT 'Chief Financial Officer & Fleet Director',
    phone TEXT NOT NULL DEFAULT '+254 712 984 551',
    location TEXT NOT NULL DEFAULT 'Nairobi Central Operating Hub',
    avatar_url TEXT,
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. EXPENSES & DRIVER CASH VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    claimant TEXT NOT NULL,
    role TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    amount_kes NUMERIC NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'held', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. RECONCILIATION TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reconciliation_txns (
    id TEXT PRIMARY KEY,
    feed_title TEXT NOT NULL,
    feed_subtitle TEXT NOT NULL,
    feed_time TEXT NOT NULL,
    amount_kes NUMERIC NOT NULL,
    channel TEXT NOT NULL,
    channel_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'review' CHECK (status IN ('matched', 'review', 'unreconciled')),
    erp_title TEXT,
    erp_subtitle TEXT,
    confidence_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_txns ENABLE ROW LEVEL SECURITY;

-- CREATE PERMISSIVE RLS POLICIES FOR APP OPERATION
-- (Allows full select/insert/update/delete for authenticated and public anon keys)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to vehicles" ON public.vehicles;
    CREATE POLICY "Public access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to customers" ON public.customers;
    CREATE POLICY "Public access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to company_profile" ON public.company_profile;
    CREATE POLICY "Public access to company_profile" ON public.company_profile FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to user_profile" ON public.user_profile;
    CREATE POLICY "Public access to user_profile" ON public.user_profile FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to expenses" ON public.expenses;
    CREATE POLICY "Public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to reconciliation_txns" ON public.reconciliation_txns;
    CREATE POLICY "Public access to reconciliation_txns" ON public.reconciliation_txns FOR ALL USING (true) WITH CHECK (true);
END $$;

-- SEED INITIAL DATA: COMPANY PROFILE
INSERT INTO public.company_profile (
    id, legal_name, trading_name, registration_city, tax_pin,
    bank_name, bank_bic, account_number, iban_masked,
    default_currency, exchange_rate_kes_per_usd, hq_address,
    key_director, director_id, key_shareholder
) VALUES (
    'default',
    'BEYAYAN LIMITED',
    'Beyayan Petroleum & Logistics',
    'Nairobi, Kenya',
    'P051394821Z',
    'I&M Bank Kenya',
    'IMBLKENATRD',
    '01306297851250',
    '1.31E+12 (Masked IBAN)',
    'USD',
    127.20,
    'Industrial Area, Enterprise Road, Nairobi, Kenya',
    'Akbar Ahmed Abdulrahman',
    '24312880',
    'Ali Ahmed Ali'
) ON CONFLICT (id) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    account_number = EXCLUDED.account_number;

-- SEED INITIAL DATA: USER PROFILE
INSERT INTO public.user_profile (
    id, full_name, email, role, phone, location, notifications_enabled, sms_alerts_enabled
) VALUES (
    'current',
    'David Kimani',
    'ayubalansari98@gmail.com',
    'Chief Financial Officer & Fleet Director',
    '+254 712 984 551',
    'Nairobi Central Operating Hub',
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- SEED INITIAL DATA: VEHICLES
INSERT INTO public.vehicles (
    id, reg, make_model, driver, driver_id, driver_initials,
    corridor, trip_code, trip_location, distance_km, fuel_consumed_l,
    actual_km_l, target_km_l, efficiency_pct, fuel_cost_kes, status, avatar_bg
) VALUES
('veh-1', 'KDA 542T', 'Scania R500 V8', 'John Mwangi', 'DRV-084', 'JM', 'Mombasa - Kampala', 'TRP-0241', 'Eldoret Escarpment (Mile 412)', 412, 185.6, 2.22, 2.40, -7.5, 41250, 'Anomaly', 'bg-primary'),
('veh-2', 'KBZ 119M', 'Mercedes Actros 3340', 'Peter Otieno', 'DRV-019', 'PO', 'Nairobi - Kigali', 'TRP-0244', 'Katuna Border Clearing', 620, 248.0, 2.50, 2.40, 4.2, 54500, 'Active', 'bg-tertiary'),
('veh-3', 'KDE 304K', 'Volvo FH16 540', 'Ali Hassan', 'DRV-112', 'AH', 'Mombasa - Malaba', 'TRP-0239', 'Malaba OSBP Yard (Offloading)', 880, 366.7, 2.40, 2.40, 0.0, 79200, 'Completed', 'bg-slate-700'),
('veh-4', 'KCC 901P', 'MAN TGX 26.480', 'Samuel Koech', 'DRV-045', 'SK', 'Nairobi - Mombasa Return', 'TRP-0246', 'Mtito Andei Fueling Bay', 230, 92.0, 2.50, 2.40, 4.2, 20240, 'Active', 'bg-primary'),
('veh-5', 'KDF 412B', 'Scania R500 Streamline', 'David Oduor', 'DRV-077', 'DO', 'Mombasa - Kampala (HFO)', 'TRP-0248', 'Jinja Industrial Depot', 740, 310.9, 2.38, 2.40, -0.8, 68400, 'Active', 'bg-emerald-700'),
('veh-6', 'KDG 819M', 'Mercedes Actros 3344', 'Emmanuel Kiprono', 'DRV-092', 'EK', 'Eldoret - Goma DRC', 'TRP-0250', 'Tororo Weighbridge', 340, 142.9, 2.38, 2.40, -0.8, 31400, 'Active', 'bg-blue-700')
ON CONFLICT (reg) DO NOTHING;

-- SEED INITIAL DATA: CUSTOMERS
INSERT INTO public.customers (
    id, name, tin_number, corridor, cargo_type, contact_person,
    phone, email, billing_currency, total_volume_tonnes, total_revenue_usd,
    outstanding_ar_usd, credit_days, active_trips, status, location, contract_expiry
) VALUES
('cust-1', 'ONE PETROLEUM (U) LIMITED', '1001200921528', 'Mombasa - Malaba - Kampala (HFO Transit Corridor)', 'Heavy Fuel Oil (HFO) 380 cSt & Industrial Bitumen', 'Robert Byamugisha (Supply Chain Director)', '+256 414 256890 / +256 772 458902', 'logistics@onepetroleum.ug', 'USD', 780, 26483.40, 0.00, 15, 4, 'Contract Active', 'Railway Goodshed Entebbe Road, Kampala, Uganda', '31 Dec 2027'),
('cust-2', 'VIVO ENERGY UGANDA LIMITED', '1000049210', 'Mombasa - Jinja - Kampala Corridor', 'Automotive Gas Oil (AGO Diesel 50ppm) & Jet A-1', 'Sarah Nabwire (Corridor Haulage Manager)', '+256 312 360000', 'dispatch.ug@vivoenergy.com', 'USD', 1240, 48200.00, 7400.00, 30, 6, 'Contract Active', '7th Street Industrial Area, Kampala, Uganda', '30 Sep 2027'),
('cust-3', 'TOTALENERGIES MARKETING RWANDA SA', '100018492', 'Mombasa - Katuna - Kigali Transit Route', 'Premium Motor Spirit (PMS Petrol) & Engine Oils', 'Jean-Paul Habimana (Regional Transport Lead)', '+250 252 590000', 'haulage.rw@totalenergies.com', 'USD', 920, 39600.00, 6800.00, 21, 3, 'Contract Active', 'Boulevard de l''Umuganda, Gatsata Depot, Kigali, Rwanda', '15 Jun 2027'),
('cust-4', 'MUKWANO INDUSTRIES UGANDA', '1000012903', 'Mombasa - Busia - Kampala Corridor', 'Crude Palm Oil (CPO Bulk) & Edible Liquid Fats', 'Rajesh Patel (Inbound Logistics Lead)', '+256 414 313313', 'procurement@mukwano.com', 'USD', 640, 22500.00, 4200.00, 15, 2, 'Contract Active', 'Mukwano Complex, Kibuli Road, Kampala, Uganda', '31 Mar 2027'),
('cust-5', 'DALBIT PETROLEUM KENYA / DRC CORRIDOR', 'P051184920M', 'Eldoret - Malaba - Goma DRC Transit', 'Low Sulphur Gasoil & Mining Fuel Supplies', 'Moses Kiprotich (Northern Corridor Freight Ops)', '+254 20 3753000', 'ops@dalbitpetroleum.com', 'USD', 450, 18900.00, 0.00, 14, 1, 'Contract Active', 'Delta Corner Annex, Westlands, Nairobi, Kenya', '30 Nov 2027')
ON CONFLICT (name) DO NOTHING;
