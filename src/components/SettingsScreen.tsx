import React, { useState } from 'react';
import { CompanyProfile, UserProfile } from '../types';

interface SettingsScreenProps {
  companyProfile: CompanyProfile;
  userProfile: UserProfile;
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  onUpdateUserProfile: (profile: UserProfile) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  companyProfile,
  userProfile,
  onUpdateCompanyProfile,
  onUpdateUserProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'user' | 'fleet-rules' | 'treasury'>('company');

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
              {userForm.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
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
                Role & Authorization
              </label>
              <input
                type="text"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-[#dce9ff] focus:outline-none"
              />
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
              onClick={() => triggerToast('Fleet telemetry benchmarks saved!')}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all"
            >
              Update Telematics Engine
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
              onClick={() => triggerToast('Treasury & SWIFT automation rules saved!')}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all"
            >
              Save Treasury Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
