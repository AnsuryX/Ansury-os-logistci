import React, { useState, useEffect } from 'react';
import { CompanyProfile, UserProfile, Vehicle, Customer, SystemSettings } from '../types';
import { safeInitials } from '../utils/format';
import {
  checkSupabaseHealth,
  SupabaseHealthStatus,
  upsertVehicleToSupabase,
  upsertCustomerToSupabase,
  upsertCompanyProfileToSupabase,
  upsertUserProfileToSupabase,
  fetchSystemSettingsFromSupabase,
  saveSystemSettingsToSupabase,
} from '../lib/supabase';
import {
  SUPABASE_CONFIG,
  SUPABASE_SQL_SCHEMA,
  SUPABASE_V2_AUTH_RLS_MIGRATION,
  SUPABASE_V3_SYSTEM_SETTINGS_MIGRATION,
} from '../data/supabaseSchema';
import { useAuth } from '../lib/auth';
import { ROLE_METADATA } from '../lib/permissions';
import { UserManagementScreen } from './UserManagementScreen';

interface SettingsScreenProps {
  companyProfile: CompanyProfile;
  userProfile: UserProfile;
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  onUpdateUserProfile: (profile: UserProfile) => void;
  vehicles?: Vehicle[];
  customers?: Customer[];
  systemSettings?: SystemSettings;
  onUpdateSystemSettings?: (settings: SystemSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  companyProfile,
  userProfile,
  onUpdateCompanyProfile,
  onUpdateUserProfile,
  vehicles = [],
  customers = [],
}) => {
  const { role, user, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'company' | 'user' | 'users-mgmt' | 'fleet-rules' | 'treasury' | 'database'>('company');

  // Selected migration version in database tab
  const [selectedMigrationVersion, setSelectedMigrationVersion] = useState<'v3' | 'v2' | 'v1'>('v3');

  // Password reset self-service state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  // Company state
  const [companyForm, setCompanyForm] = useState<CompanyProfile>(companyProfile);

  // User state
  const [userForm, setUserForm] = useState<UserProfile>(userProfile);

  // Fleet & telematics parameters
  const [targetFuelBenchmark, setTargetFuelBenchmark] = useState('2.40');
  const [fuelSpikeThreshold, setFuelSpikeThreshold] = useState('12.5');
  const [demurrageRateUsd, setDemurrageRateUsd] = useState('250.00');
  const [weighbridgeTolerancePct, setWeighbridgeTolerancePct] = useState('0.50');
  const [speedLimitKmh, setSpeedLimitKmh] = useState('80');
  const [nightCurfewEnabled, setNightCurfewEnabled] = useState(true);

  // Treasury automation
  const [mpesaMinFloatKes, setMpesaMinFloatKes] = useState('250000');
  const [autoMatchSwift, setAutoMatchSwift] = useState(true);
  const [pettyCashDailyLimitKes, setPettyCashDailyLimitKes] = useState('100000');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase Database state
  const [dbHealth, setDbHealth] = useState<SupabaseHealthStatus | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isSeedingDb, setIsSeedingDb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Auto-hydrate system settings from Supabase or props
  useEffect(() => {
    async function loadSettings() {
      if (systemSettings) {
        setTargetFuelBenchmark(String(systemSettings.targetFuelBenchmark));
        setFuelSpikeThreshold(String(systemSettings.fuelSpikeThreshold));
        setDemurrageRateUsd(String(systemSettings.demurrageRateUsd));
        setWeighbridgeTolerancePct(String(systemSettings.weighbridgeTolerancePct));
        setSpeedLimitKmh(String(systemSettings.speedLimitKmh));
        setNightCurfewEnabled(systemSettings.nightCurfewEnabled);
        setMpesaMinFloatKes(String(systemSettings.mpesaMinFloatKes));
        setAutoMatchSwift(systemSettings.autoMatchSwift);
        setPettyCashDailyLimitKes(String(systemSettings.pettyCashDailyLimitKes));
      } else {
        const cloudSettings = await fetchSystemSettingsFromSupabase();
        if (cloudSettings) {
          setTargetFuelBenchmark(String(cloudSettings.targetFuelBenchmark));
          setFuelSpikeThreshold(String(cloudSettings.fuelSpikeThreshold));
          setDemurrageRateUsd(String(cloudSettings.demurrageRateUsd));
          setWeighbridgeTolerancePct(String(cloudSettings.weighbridgeTolerancePct));
          setSpeedLimitKmh(String(cloudSettings.speedLimitKmh));
          setNightCurfewEnabled(cloudSettings.nightCurfewEnabled);
          setMpesaMinFloatKes(String(cloudSettings.mpesaMinFloatKes));
          setAutoMatchSwift(cloudSettings.autoMatchSwift);
          setPettyCashDailyLimitKes(String(cloudSettings.pettyCashDailyLimitKes));
        }
      }
    }
    loadSettings();
  }, [systemSettings]);

  const handleSaveFleetRules = async () => {
    const updated: SystemSettings = {
      id: 'ansury_fleet_default',
      targetFuelBenchmark: parseFloat(targetFuelBenchmark) || 2.40,
      fuelSpikeThreshold: parseFloat(fuelSpikeThreshold) || 12.50,
      demurrageRateUsd: parseFloat(demurrageRateUsd) || 250.00,
      weighbridgeTolerancePct: parseFloat(weighbridgeTolerancePct) || 0.50,
      speedLimitKmh: parseInt(speedLimitKmh, 10) || 80,
      nightCurfewEnabled,
      mpesaMinFloatKes: parseFloat(mpesaMinFloatKes) || 250000.00,
      autoMatchSwift,
      pettyCashDailyLimitKes: parseFloat(pettyCashDailyLimitKes) || 100000.00,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.fullName || 'Super Administrator',
    };

    onUpdateSystemSettings?.(updated);
    const persisted = await saveSystemSettingsToSupabase(updated, user?.fullName || 'Super Administrator');
    triggerToast(
      persisted
        ? 'Fleet telemetry benchmarks persisted to system_settings in Supabase!'
        : 'Fleet telemetry benchmarks saved to active session.'
    );
  };

  const handleSaveTreasuryRules = async () => {
    const updated: SystemSettings = {
      id: 'ansury_fleet_default',
      targetFuelBenchmark: parseFloat(targetFuelBenchmark) || 2.40,
      fuelSpikeThreshold: parseFloat(fuelSpikeThreshold) || 12.50,
      demurrageRateUsd: parseFloat(demurrageRateUsd) || 250.00,
      weighbridgeTolerancePct: parseFloat(weighbridgeTolerancePct) || 0.50,
      speedLimitKmh: parseInt(speedLimitKmh, 10) || 80,
      nightCurfewEnabled,
      mpesaMinFloatKes: parseFloat(mpesaMinFloatKes) || 250000.00,
      autoMatchSwift,
      pettyCashDailyLimitKes: parseFloat(pettyCashDailyLimitKes) || 100000.00,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.fullName || 'Super Administrator',
    };

    onUpdateSystemSettings?.(updated);
    const persisted = await saveSystemSettingsToSupabase(updated, user?.fullName || 'Super Administrator');
    triggerToast(
      persisted
        ? 'Treasury & SWIFT automation rules persisted to system_settings in Supabase!'
        : 'Treasury & SWIFT automation rules saved to active session.'
    );
  };

  const checkDb = async () => {
    setIsCheckingDb(true);
    const res = await checkSupabaseHealth();
    setDbHealth(res);
    setIsCheckingDb(false);
  };

  useEffect(() => {
    if (activeTab === 'database') {
      checkDb();
    }
  }, [activeTab]);

  const handleCopySql = () => {
    let sqlToCopy = SUPABASE_V3_SYSTEM_SETTINGS_MIGRATION;
    if (selectedMigrationVersion === 'v2') sqlToCopy = SUPABASE_V2_AUTH_RLS_MIGRATION;
    if (selectedMigrationVersion === 'v1') sqlToCopy = SUPABASE_SQL_SCHEMA;

    navigator.clipboard.writeText(sqlToCopy);
    setCopiedSql(true);
    triggerToast(
      `SQL Migration (${selectedMigrationVersion.toUpperCase()}) copied! Paste into Supabase SQL Editor and click Run.`
    );
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handlePushToSupabase = async () => {
    setIsSeedingDb(true);
    triggerToast('Pushing company profile, vehicles, and customers to Supabase...');

    let vCount = 0;
    for (const v of vehicles) {
      if (await upsertVehicleToSupabase(v)) vCount++;
    }
    let cCount = 0;
    for (const c of customers) {
      if (await upsertCustomerToSupabase(c)) cCount++;
    }
    await upsertCompanyProfileToSupabase(companyForm);
    await upsertUserProfileToSupabase(userForm);

    setIsSeedingDb(false);
    triggerToast(`Sync complete! Pushed company profile, ${vCount} vehicles, and ${cCount} shippers.`);
    await checkDb();
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile(companyForm);
    triggerToast(`Company details updated successfully: ${companyForm.legalName}!`);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile(userForm);
    triggerToast(`User profile updated successfully for ${userForm.fullName}!`);
  };

  return (
    <div className="p-space-lg space-y-space-lg pb-24 max-w-5xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">verified</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">settings</span>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              System Settings & Corporate Administration
            </h1>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Configure entity profile, banking parameters, operator credentials, and telematics threshold engines.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-surface-container-lowest p-2 rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'company'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">domain</span>
          Company Entity & Bank Profile
        </button>

        <button
          onClick={() => setActiveTab('user')}
          className={`px-4 py-2 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'user'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">person</span>
          User Profile & Security
        </button>

        {role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('users-mgmt')}
            className={`px-4 py-2 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'users-mgmt'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
            User & Role Management (SEC-01)
          </button>
        )}

        <button
          onClick={() => setActiveTab('fleet-rules')}
          className={`px-4 py-2 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'fleet-rules'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          Fleet & Fuel Benchmarks
        </button>

        <button
          onClick={() => setActiveTab('treasury')}
          className={`px-4 py-2 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'treasury'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          Treasury & SWIFT Rules
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl font-body-sm text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">database</span>
          <span>Database & Cloud Sync</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
        </button>
      </div>

      {/* TAB 1: COMPANY ENTITY & BANK PROFILE */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-surface-container-lowest rounded-2xl p-6 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Legal Company & Statutory Banking Identity
              </h2>
              <p className="font-body-sm text-[12px] text-outline">
                These settings drive the corporate branding across the header, invoices, and financial statements.
              </p>
            </div>
            <span className="font-label-code text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              Active Entity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Legal Registered Entity Name *
              </label>
              <input
                type="text"
                value={companyForm.legalName}
                onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-semibold text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Trading / Operating Brand
              </label>
              <input
                type="text"
                value={companyForm.tradingName}
                onChange={(e) => setCompanyForm({ ...companyForm, tradingName: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Registration Jurisdiction & City
              </label>
              <input
                type="text"
                value={companyForm.registrationCity}
                onChange={(e) => setCompanyForm({ ...companyForm, registrationCity: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                KRA Tax Identification PIN
              </label>
              <input
                type="text"
                value={companyForm.taxPin}
                onChange={(e) => setCompanyForm({ ...companyForm, taxPin: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Operating Bank Name
              </label>
              <input
                type="text"
                value={companyForm.bankName}
                onChange={(e) => setCompanyForm({ ...companyForm, bankName: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                SWIFT BIC Code
              </label>
              <input
                type="text"
                value={companyForm.bankBic}
                onChange={(e) => setCompanyForm({ ...companyForm, bankBic: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Settlement Bank Account Number
              </label>
              <input
                type="text"
                value={companyForm.accountNumber}
                onChange={(e) => setCompanyForm({ ...companyForm, accountNumber: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Live FX Conversion Rate (KES per 1 USD)
              </label>
              <input
                type="number"
                step="0.05"
                value={companyForm.exchangeRateKesPerUsd}
                onChange={(e) => setCompanyForm({ ...companyForm, exchangeRateKesPerUsd: parseFloat(e.target.value) || 127.2 })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Key Director & Signatory
              </label>
              <input
                type="text"
                value={companyForm.keyDirector}
                onChange={(e) => setCompanyForm({ ...companyForm, keyDirector: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Director National ID / Passport
              </label>
              <input
                type="text"
                value={companyForm.directorId}
                onChange={(e) => setCompanyForm({ ...companyForm, directorId: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Corporate HQ Physical Address
              </label>
              <input
                type="text"
                value={companyForm.hqAddress}
                onChange={(e) => setCompanyForm({ ...companyForm, hqAddress: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5eeff] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Save Corporate Entity Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: USER PROFILE & SECURITY */}
      {activeTab === 'user' && (
        <form onSubmit={handleSaveUser} className="bg-surface-container-lowest rounded-2xl p-6 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                User Details & Operational Permissions
              </h2>
              <p className="font-body-sm text-[12px] text-outline">
                Manage your credentials, dispatch role, and real-time alert preferences.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {safeInitials(userForm.fullName)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={userForm.fullName}
                onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-semibold text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Assigned Operational Role (SEC-01 Protected)
              </label>
              <div className="w-full h-10 px-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                  <span className="font-bold text-on-surface text-[12px]">
                    {ROLE_METADATA[role]?.label || userForm.role}
                  </span>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Institutional Role
                </span>
              </div>
              <span className="text-[10px] text-outline mt-1 block">
                Role and dispatch permissions are managed institutional-wide by Super Administrators under SEC-01 Policy.
              </span>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Phone Number (M-Pesa Connected)
              </label>
              <input
                type="text"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Operating Location / Base Hub
              </label>
              <input
                type="text"
                value={userForm.location}
                onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>
          </div>

          {/* Password Self-Service */}
          <div className="pt-3 border-t border-[#eff4ff] space-y-3">
            <h3 className="font-headline-sm text-[13px] font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">lock</span>
              Security Credentials & Password
            </h3>

            {passwordFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-xl">
                {passwordFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-outline mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 px-3 bg-surface-container-low rounded-xl text-xs border border-[#dce9ff]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-outline mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-9 px-3 bg-surface-container-low rounded-xl text-xs border border-[#dce9ff]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-outline mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-9 px-3 bg-surface-container-low rounded-xl text-xs border border-[#dce9ff]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newPassword || newPassword.length < 8) {
                    triggerToast('Password must be at least 8 characters long.');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    triggerToast('New passwords do not match.');
                    return;
                  }
                  setPasswordFeedback('Password updated and re-encrypted successfully in Supabase Auth directory.');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setTimeout(() => setPasswordFeedback(null), 4000);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface font-semibold text-[11px] border border-[#dce9ff] transition-all"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Notification toggles */}
          <div className="pt-2 border-t border-[#eff4ff] space-y-3">
            <h3 className="font-headline-sm text-[13px] font-bold text-on-surface">
              Real-Time Security & Alert Channels
            </h3>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
              <div>
                <span className="font-semibold text-on-surface block text-[13px]">Inward SWIFT Wire Remittance Alerts</span>
                <span className="text-[11px] text-outline">Receive instant notification upon pacs.008 confirmation at I&M Bank</span>
              </div>
              <input
                type="checkbox"
                checked={userForm.notificationsEnabled}
                onChange={(e) => setUserForm({ ...userForm, notificationsEnabled: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
              <div>
                <span className="font-semibold text-on-surface block text-[13px]">Fuel Escarpment Anomaly SMS Alerts</span>
                <span className="text-[11px] text-outline">Trigger priority SMS to dispatcher when consumption exceeds +10% target</span>
              </div>
              <input
                type="checkbox"
                checked={userForm.smsAlertsEnabled}
                onChange={(e) => setUserForm({ ...userForm, smsAlertsEnabled: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5eeff] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Save User Profile
            </button>
          </div>
        </form>
      )}

      {/* TAB: USER & ROLE MANAGEMENT (SEC-01) */}
      {activeTab === 'users-mgmt' && (
        <UserManagementScreen
          currentActorName={user?.fullName || userForm.fullName}
          currentActorRole={ROLE_METADATA[role]?.label || 'Super Administrator'}
        />
      )}

      {/* TAB 3: FLEET & FUEL BENCHMARKS */}
      {activeTab === 'fleet-rules' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-3">
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Fleet Engineering & Telematics Thresholds
            </h2>
            <p className="font-body-sm text-[12px] text-outline">
              Tune automated anomaly triggers, speed limits, and weighbridge tolerance rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Target Corridor Fuel Benchmark (km/L)
              </label>
              <input
                type="number"
                step="0.05"
                value={targetFuelBenchmark}
                onChange={(e) => setTargetFuelBenchmark(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
              <span className="text-[11px] text-outline mt-1 block">Baseline: 2.40 km/L on laden Scania R500</span>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Fuel Anomaly Spike Threshold (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={fuelSpikeThreshold}
                onChange={(e) => setFuelSpikeThreshold(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-error border border-[#dce9ff] focus:outline-none"
              />
              <span className="text-[11px] text-outline mt-1 block">Auto-flags when section burn exceeds +12.5%</span>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Demurrage Daily Penalty ($ USD / day)
              </label>
              <input
                type="number"
                value={demurrageRateUsd}
                onChange={(e) => setDemurrageRateUsd(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
              <span className="text-[11px] text-outline mt-1 block">Billed to shipper after 48 hrs free detention</span>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Weighbridge Axle Tolerance (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={weighbridgeTolerancePct}
                onChange={(e) => setWeighbridgeTolerancePct(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
              <span className="text-[11px] text-outline mt-1 block">East African Community (EAC) Axle Load Limit</span>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Maximum Speed Alert (km/h)
              </label>
              <input
                type="number"
                value={speedLimitKmh}
                onChange={(e) => setSpeedLimitKmh(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl self-end">
              <div>
                <span className="font-semibold text-on-surface block text-[13px]">Night Driving Curfew (22:00 - 05:00)</span>
                <span className="text-[11px] text-outline">Safety lock on cross-border petroleum tankers</span>
              </div>
              <input
                type="checkbox"
                checked={nightCurfewEnabled}
                onChange={(e) => setNightCurfewEnabled(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5eeff] flex justify-end">
            <button
              onClick={handleSaveFleetRules}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Update Telematics Engine</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: TREASURY & SWIFT RULES */}
      {activeTab === 'treasury' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-3">
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Treasury Controls & Automated Reconciliation
            </h2>
            <p className="font-body-sm text-[12px] text-outline">
              Configure M-Pesa Daraja B2C limits, SWIFT auto-posting, and petty cash thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                M-Pesa B2C Minimum Float Balance (KES)
              </label>
              <input
                type="number"
                value={mpesaMinFloatKes}
                onChange={(e) => setMpesaMinFloatKes(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
              <span className="text-[11px] text-outline mt-1 block">Triggers top-up notice from I&M bank treasury</span>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Daily Petty Cash Disbursement Limit (KES)
              </label>
              <input
                type="number"
                value={pettyCashDailyLimitKes}
                onChange={(e) => setPettyCashDailyLimitKes(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code font-bold text-on-surface border border-[#dce9ff] focus:outline-none"
              />
              <span className="text-[11px] text-outline mt-1 block">Requires dual approval if exceeded</span>
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
              <div>
                <span className="font-semibold text-on-surface block text-[13px]">Automatic SWIFT pacs.008 Invoice Match</span>
                <span className="text-[11px] text-outline">
                  Auto-settle outstanding waybills when UETR matching customer remittance advice is verified.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoMatchSwift}
                onChange={(e) => setAutoMatchSwift(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5eeff] flex justify-end">
            <button
              onClick={handleSaveTreasuryRules}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Treasury Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE & SUPABASE CLOUD */}
      {activeTab === 'database' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-[#e5eeff] pb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-base font-bold text-on-surface">
                  Supabase Cloud PostgreSQL Database
                </h2>
                <span className="font-label-code text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  PROJECT: {SUPABASE_CONFIG.projectRef}
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-outline">
                Direct integration with your Supabase cloud backend for real-time fleet, customer, and accounting persistence.
              </p>
            </div>

            <button
              onClick={checkDb}
              disabled={isCheckingDb}
              className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-code text-[11px] font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[15px] ${isCheckingDb ? 'animate-spin' : ''}`}>
                refresh
              </span>
              {isCheckingDb ? 'Probing...' : 'Probe Database'}
            </button>
          </div>

          {/* Connection Status Card */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-[#dce9ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-on-surface text-[14px]">
                  Connected to Supabase Cluster
                </span>
                {dbHealth && dbHealth.latencyMs > 0 && (
                  <span className="font-label-code text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {dbHealth.latencyMs}ms Latency
                  </span>
                )}
              </div>
              <div className="font-label-code text-[12px] text-outline break-all">
                REST Endpoint: <span className="text-on-surface font-semibold">{SUPABASE_CONFIG.url}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={SUPABASE_CONFIG.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container font-body-sm text-[12px] font-semibold text-on-surface flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Supabase Dashboard
              </a>
            </div>
          </div>

          {/* Migration Quick-Action Banner */}
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 text-[12px] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-[13px]">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                <span>Execute Database Migrations in Supabase</span>
              </div>

              {/* Migration Selector Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-blue-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMigrationVersion('v3')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedMigrationVersion === 'v3'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  Migration v3 (System Settings)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMigrationVersion('v2')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedMigrationVersion === 'v2'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  Migration v2 (Auth, Roles & RLS)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMigrationVersion('v1')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedMigrationVersion === 'v1'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  Migration v1 (Base Schema)
                </button>
              </div>
            </div>

            <p className="text-blue-900/80 leading-relaxed">
              {selectedMigrationVersion === 'v3' ? (
                <>
                  <strong>Migration 003 (003_system_settings.sql)</strong> provisions the <code>system_settings</code> table with RLS rules, preserving live fuel consumption baselines, demurrage penalties, weighbridge tolerances, and Safaricom M-Pesa B2C minimum floats.
                </>
              ) : selectedMigrationVersion === 'v2' ? (
                <>
                  <strong>Migration 002 (002_auth_rls.sql)</strong> provisions institutional RBAC roles (<code>super_admin</code>, <code>finance_controller</code>, <code>fleet_ops_manager</code>, <code>dispatcher_clerk</code>, <code>driver</code>), the append-only <code>audit_logs</code> table, invoices/payments sub-ledgers, and the strict <strong>SEC-04</strong> trigger blocking self-approvals.
                </>
              ) : (
                <>
                  <strong>Migration 001 (schema.sql)</strong> provisions base fleet prime movers, commercial shipper contracts, company corporate identity, and expense voucher repositories.
                </>
              )}
            </p>

            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <button
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-primary text-white font-body-sm text-[12px] font-semibold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedSql ? 'check' : 'content_copy'}
                </span>
                {copiedSql
                  ? 'Copied to Clipboard!'
                  : `Copy Migration ${selectedMigrationVersion.toUpperCase()} SQL`}
              </button>

              <a
                href={SUPABASE_CONFIG.sqlEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface font-body-sm text-[12px] font-semibold hover:bg-surface-container transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Open Supabase SQL Editor
              </a>

              <button
                onClick={handlePushToSupabase}
                disabled={isSeedingDb}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-body-sm text-[12px] font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSeedingDb ? 'animate-spin' : ''}`}>
                  {isSeedingDb ? 'sync' : 'cloud_upload'}
                </span>
                {isSeedingDb ? 'Syncing...' : 'Push Application Records'}
              </button>
            </div>
          </div>

          {/* Tables Schema Status */}
          <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] overflow-hidden">
            <div className="px-4 py-2.5 bg-surface-container-low border-b border-[#e5eeff] flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline font-semibold uppercase">
                Database Schema Tables (`public`)
              </span>
              <span className="font-label-code text-[11px] text-outline">
                {dbHealth && Object.values(dbHealth.tables).some(Boolean) ? 'Connected & Verified' : 'Ready to Provision'}
              </span>
            </div>

            <div className="divide-y divide-[#eff4ff]">
              {[
                {
                  name: 'app_users',
                  desc: 'Institutional identity directory keyed to auth.users with 5 roles and SEC-01 governance',
                  count: '5 personas',
                  live: dbHealth?.tables.app_users,
                },
                {
                  name: 'audit_logs',
                  desc: 'Immutable append-only audit trail recording every approval, rejection, and role change',
                  count: 'Ledger table',
                  live: dbHealth?.tables.audit_logs,
                },
                {
                  name: 'invoices',
                  desc: 'Accounts Receivable lifecycle (draft, issued, partially_paid, paid, refunded, voided)',
                  count: 'AR sub-ledger',
                  live: dbHealth?.tables.invoices,
                },
                {
                  name: 'vehicles',
                  desc: 'GPS telematics, driver assignments, tank capacities, actual km/L vs target',
                  count: `${vehicles.length} assets`,
                  live: dbHealth?.tables.vehicles,
                },
                {
                  name: 'customers',
                  desc: 'Petroleum marketing contracts (Vivo, Total, One Petroleum), TINs, AR aging',
                  count: `${customers.length} shippers`,
                  live: dbHealth?.tables.customers,
                },
                {
                  name: 'company_profile',
                  desc: `${companyForm.legalName} corporate registration, KRA PIN, I&M Bank settlement`,
                  count: '1 corporate entity',
                  live: dbHealth?.tables.company_profile,
                },
                {
                  name: 'user_profile',
                  desc: `${userForm.fullName} dispatch role, verified credentials, M-Pesa phone`,
                  count: '1 active operator',
                  live: dbHealth?.tables.user_profile,
                },
                {
                  name: 'expenses',
                  desc: 'Driver petty cash vouchers, fuel card receipts, workshop maintenance audits (SEC-04)',
                  count: 'Claim ledger',
                  live: dbHealth?.tables.expenses,
                },
              ].map((table) => (
                <div key={table.name} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-code font-bold text-on-surface text-[13px]">
                        public.{table.name}
                      </span>
                      <span className="font-label-code text-[10px] text-outline bg-surface-container px-1.5 py-0.5 rounded">
                        {table.count}
                      </span>
                    </div>
                    <p className="font-body-sm text-[11px] text-outline mt-0.5">
                      {table.desc}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {table.live ? (
                      <span className="inline-flex items-center gap-1 font-label-code text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Live & Synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-label-code text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        Ready in Schema
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline font-semibold uppercase">
                PostgreSQL DDL Migration ({selectedMigrationVersion.toUpperCase()}) Code Preview
              </span>
              <button
                onClick={handleCopySql}
                className="font-label-code text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                {copiedSql ? 'Copied' : `Copy Migration ${selectedMigrationVersion.toUpperCase()} SQL`}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-[11px] font-label-code overflow-x-auto max-h-64 leading-relaxed border border-slate-800 select-all">
              {selectedMigrationVersion === 'v2'
                ? SUPABASE_V2_AUTH_RLS_MIGRATION
                : SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
