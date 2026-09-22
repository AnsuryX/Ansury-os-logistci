import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../data/supabaseSchema';
import { Vehicle, Customer, CompanyProfile, UserProfile } from '../types';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  SUPABASE_CONFIG.url;

const supabasePublishableKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  SUPABASE_CONFIG.publishableKey;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { persistSession: false },
});

export interface SupabaseHealthStatus {
  isConnected: boolean;
  latencyMs: number;
  url: string;
  projectRef: string;
  tables: {
    vehicles: boolean;
    customers: boolean;
    company_profile: boolean;
    user_profile: boolean;
    expenses: boolean;
  };
  errorMessage?: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const start = performance.now();
  const result: SupabaseHealthStatus = {
    isConnected: false,
    latencyMs: 0,
    url: supabaseUrl,
    projectRef: SUPABASE_CONFIG.projectRef,
    tables: {
      vehicles: false,
      customers: false,
      company_profile: false,
      user_profile: false,
      expenses: false,
    },
  };

  try {
    // Probe vehicles table
    const { error: vErr } = await supabase.from('vehicles').select('id').limit(1);
    result.latencyMs = Math.round(performance.now() - start);
    result.isConnected = true;
    result.tables.vehicles = !vErr;

    // Probe customers table
    const { error: cErr } = await supabase.from('customers').select('id').limit(1);
    result.tables.customers = !cErr;

    // Probe company_profile table
    const { error: cpErr } = await supabase.from('company_profile').select('id').limit(1);
    result.tables.company_profile = !cpErr;

    // Probe user_profile table
    const { error: upErr } = await supabase.from('user_profile').select('id').limit(1);
    result.tables.user_profile = !upErr;

    // Probe expenses table
    const { error: eErr } = await supabase.from('expenses').select('id').limit(1);
    result.tables.expenses = !eErr;

    return result;
  } catch (err: any) {
    result.isConnected = false;
    result.errorMessage = err?.message || 'Connection failed';
    return result;
  }
}

// ==========================================
// VEHICLES REPOSITORY
// ==========================================
export async function fetchVehiclesFromSupabase(): Promise<Vehicle[] | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      reg: row.reg,
      makeModel: row.make_model,
      driver: row.driver,
      driverId: row.driver_id,
      driverInitials: row.driver_initials,
      corridor: row.corridor,
      tripCode: row.trip_code,
      tripLocation: row.trip_location,
      distanceKm: Number(row.distance_km || 0),
      fuelConsumedL: Number(row.fuel_consumed_l || 0),
      actualKmL: Number(row.actual_km_l || 2.4),
      targetKmL: Number(row.target_km_l || 2.4),
      efficiencyPct: Number(row.efficiency_pct || 0),
      fuelCostKes: Number(row.fuel_cost_kes || 0),
      status: row.status as Vehicle['status'],
      avatarBg: row.avatar_bg || 'bg-primary',
    }));
  } catch {
    return null;
  }
}

export async function upsertVehicleToSupabase(vehicle: Vehicle): Promise<boolean> {
  try {
    const { error } = await supabase.from('vehicles').upsert(
      {
        id: vehicle.id,
        reg: vehicle.reg,
        make_model: vehicle.makeModel,
        driver: vehicle.driver,
        driver_id: vehicle.driverId,
        driver_initials: vehicle.driverInitials,
        corridor: vehicle.corridor,
        trip_code: vehicle.tripCode,
        trip_location: vehicle.tripLocation,
        distance_km: vehicle.distanceKm,
        fuel_consumed_l: vehicle.fuelConsumedL,
        actual_km_l: vehicle.actualKmL,
        target_km_l: vehicle.targetKmL,
        efficiency_pct: vehicle.efficiencyPct,
        fuel_cost_kes: vehicle.fuelCostKes,
        status: vehicle.status,
        avatar_bg: vehicle.avatarBg,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'reg' }
    );
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// CUSTOMERS REPOSITORY
// ==========================================
export async function fetchCustomersFromSupabase(): Promise<Customer[] | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      tinNumber: row.tin_number,
      corridor: row.corridor,
      cargoType: row.cargo_type,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email,
      billingCurrency: row.billing_currency,
      totalVolumeTonnes: Number(row.total_volume_tonnes || 0),
      totalRevenueUsd: Number(row.total_revenue_usd || 0),
      outstandingArUsd: Number(row.outstanding_ar_usd || 0),
      creditDays: Number(row.credit_days || 15),
      activeTrips: Number(row.active_trips || 0),
      status: row.status,
      location: row.location,
      contractExpiry: row.contract_expiry,
    }));
  } catch {
    return null;
  }
}

export async function upsertCustomerToSupabase(customer: Customer): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').upsert(
      {
        id: customer.id,
        name: customer.name,
        tin_number: customer.tinNumber,
        corridor: customer.corridor,
        cargo_type: customer.cargoType,
        contact_person: customer.contactPerson,
        phone: customer.phone,
        email: customer.email,
        billing_currency: customer.billingCurrency,
        total_volume_tonnes: customer.totalVolumeTonnes,
        total_revenue_usd: customer.totalRevenueUsd,
        outstanding_ar_usd: customer.outstandingArUsd,
        credit_days: customer.creditDays,
        active_trips: customer.activeTrips,
        status: customer.status,
        location: customer.location,
        contract_expiry: customer.contractExpiry,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'name' }
    );
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// COMPANY PROFILE REPOSITORY
// ==========================================
export async function fetchCompanyProfileFromSupabase(): Promise<CompanyProfile | null> {
  try {
    const { data, error } = await supabase
      .from('company_profile')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) return null;

    return {
      legalName: data.legal_name,
      tradingName: data.trading_name,
      registrationCity: data.registration_city,
      taxPin: data.tax_pin,
      bankName: data.bank_name,
      bankBic: data.bank_bic,
      accountNumber: data.account_number,
      ibanMasked: data.iban_masked,
      defaultCurrency: data.default_currency,
      exchangeRateKesPerUsd: Number(data.exchange_rate_kes_per_usd || 127.2),
      hqAddress: data.hq_address,
      keyDirector: data.key_director,
      directorId: data.director_id,
      keyShareholder: data.key_shareholder,
    };
  } catch {
    return null;
  }
}

export async function upsertCompanyProfileToSupabase(profile: CompanyProfile): Promise<boolean> {
  try {
    const { error } = await supabase.from('company_profile').upsert({
      id: 'default',
      legal_name: profile.legalName,
      trading_name: profile.tradingName,
      registration_city: profile.registrationCity,
      tax_pin: profile.taxPin,
      bank_name: profile.bankName,
      bank_bic: profile.bankBic,
      account_number: profile.accountNumber,
      iban_masked: profile.ibanMasked,
      default_currency: profile.defaultCurrency,
      exchange_rate_kes_per_usd: profile.exchangeRateKesPerUsd,
      hq_address: profile.hqAddress,
      key_director: profile.keyDirector,
      director_id: profile.directorId,
      key_shareholder: profile.keyShareholder,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// USER PROFILE REPOSITORY
// ==========================================
export async function fetchUserProfileFromSupabase(): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error || !data) return null;

    return {
      fullName: data.full_name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      location: data.location,
      avatarUrl: data.avatar_url,
      notificationsEnabled: Boolean(data.notifications_enabled),
      smsAlertsEnabled: Boolean(data.sms_alerts_enabled),
    };
  } catch {
    return null;
  }
}

export async function upsertUserProfileToSupabase(profile: UserProfile): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_profile').upsert({
      id: 'current',
      full_name: profile.fullName,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
      location: profile.location,
      notifications_enabled: profile.notificationsEnabled,
      sms_alerts_enabled: profile.smsAlertsEnabled,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
