import React, { useState } from 'react';
import { Customer } from '../types';
import { AddCustomerModal } from './AddCustomerModal';
import { useAuth } from '../lib/auth';

interface CustomersScreenProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onNavigateToStatements: () => void;
  onDeleteCustomer?: (customerId: string, reason: string) => void;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({
  customers,
  onAddCustomer,
  onNavigateToStatements,
  onDeleteCustomer,
}) => {
  const { role, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tinNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCorridor = selectedCorridor === 'all' || c.corridor.includes(selectedCorridor);
    return matchesSearch && matchesCorridor;
  });

  const totalRevenue = customers.reduce((acc, c) => acc + c.totalRevenueUsd, 0);
  const totalVolume = customers.reduce((acc, c) => acc + c.totalVolumeTonnes, 0);
  const totalAr = customers.reduce((acc, c) => acc + c.outstandingArUsd, 0);
  const totalActiveTrips = customers.reduce((acc, c) => acc + c.activeTrips, 0);

  return (
    <div className="p-space-lg space-y-space-lg pb-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
              COMMERCIAL CONTRACTS & SHIPPERS
            </span>
            <span className="font-label-code text-[11px] text-outline">
              East African Petroleum Marketing Corridor
            </span>
          </div>

          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight mt-1">
            Customers & Petroleum Shippers
          </h1>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Manage contract rate cards, off-taker agreements, SWIFT pacs.008 remittance profiles, and credit lines.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateToStatements()}
            className="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            View Verified Bank Ledger
          </button>

          {role === 'driver' ? (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-body-sm text-[12px] font-semibold flex items-center gap-1.5 border border-slate-200">
              <span className="material-symbols-outlined text-[16px] text-slate-500">visibility</span>
              <span>Driver (Read-Only)</span>
            </div>
          ) : (
            <button
              disabled={!permissions.canManageCustomers}
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              + Register Shipper / Customer
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
              Contracted Volume Hauled
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
            {totalVolume.toLocaleString()} MT
          </div>
          <div className="mt-2 text-[11px] text-outline">
            Across {customers.length} verified petroleum contracts
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
              Gross Cleared Revenue
            </span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">payments</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-outline">
            Primary off-taker: One Petroleum ($26.48K)
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
              Outstanding AR Exposure
            </span>
            <span className="material-symbols-outlined text-amber-700 text-[20px]">receipt</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-amber-800 mt-2">
            ${totalAr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-outline">
            Vivo Energy ($7.4K) & TotalEnergies ($6.8K)
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
              Active En-Route Dispatches
            </span>
            <span className="material-symbols-outlined text-outline text-[20px]">navigation</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
            {totalActiveTrips} Prime Movers
          </div>
          <div className="mt-2 text-[11px] text-outline">
            Real-time GPS geofence monitored
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-3 rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search customer, TIN, contact, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface-container-low rounded-xl font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            className="h-9 px-3 bg-surface-container-low rounded-xl font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none"
          >
            <option value="all">All Transit Corridors</option>
            <option value="Kampala">Uganda Corridors (Kampala / Jinja)</option>
            <option value="Kigali">Rwanda Corridor (Kigali)</option>
            <option value="Goma">DRC Transit (Goma)</option>
          </select>

          <span className="font-label-code text-[11px] text-outline px-2 whitespace-nowrap">
            Showing {filteredCustomers.length} of {customers.length}
          </span>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-surface-container-lowest rounded-2xl p-5 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#eff4ff]">
                <div>
                  <h3 className="font-headline-sm text-[15px] font-bold text-on-surface leading-snug">
                    {cust.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-label-code text-[10px] text-outline bg-surface-container px-2 py-0.5 rounded">
                      TIN: {cust.tinNumber}
                    </span>
                    <span className="font-label-code text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      {cust.status}
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">apartment</span>
                </div>
              </div>

              {/* Cargo & Corridor Details */}
              <div className="mt-3 space-y-2 text-[12px]">
                <div>
                  <span className="font-label-sm text-[10px] text-outline uppercase font-semibold block">
                    Cargo Spec
                  </span>
                  <span className="font-medium text-on-surface">{cust.cargoType}</span>
                </div>

                <div>
                  <span className="font-label-sm text-[10px] text-outline uppercase font-semibold block">
                    Corridor Route
                  </span>
                  <span className="font-medium text-on-surface">{cust.corridor}</span>
                </div>

                <div>
                  <span className="font-label-sm text-[10px] text-outline uppercase font-semibold block">
                    Delivery Depot / Address
                  </span>
                  <span className="text-on-surface-variant">{cust.location}</span>
                </div>

                <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-outline block">Key Contact:</span>
                    <span className="font-medium text-on-surface text-[11px]">{cust.contactPerson}</span>
                  </div>
                  <span className="font-label-code text-[11px] text-primary">{cust.phone}</span>
                </div>
              </div>
            </div>

            {/* Financial Performance Footer */}
            <div className="pt-3 border-t border-[#eff4ff] bg-surface-container-low -mx-5 -mb-5 p-4 rounded-b-2xl space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-outline">Volume Hauled:</span>
                <span className="font-label-numeric font-bold text-on-surface">
                  {cust.totalVolumeTonnes} MT
                </span>
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="text-outline">Cleared Revenue:</span>
                <span className="font-label-numeric font-bold text-tertiary">
                  ${cust.totalRevenueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="text-outline">Outstanding AR:</span>
                <span
                  className={`font-label-numeric font-bold ${
                    cust.outstandingArUsd > 0 ? 'text-amber-800' : 'text-emerald-800'
                  }`}
                >
                  ${cust.outstandingArUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedCustomer(cust);
                    triggerToast(`Viewing rate card & contract terms for ${cust.name}`);
                  }}
                  className="flex-1 py-1.5 px-2 bg-surface-container-lowest hover:bg-surface-container border border-[#dce9ff] rounded-lg font-body-sm text-[11px] font-semibold text-on-surface text-center transition-colors"
                >
                  Contract & Rates
                </button>

                <button
                  onClick={() => {
                    triggerToast(`Dispatched new waybill docket for ${cust.name}`);
                  }}
                  className="py-1.5 px-2.5 bg-primary text-white hover:bg-primary-container rounded-lg font-body-sm text-[11px] font-semibold text-center transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                  New Trip
                </button>

                {(role === 'super_admin' || permissions.canDeleteRecords) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerToDelete(cust);
                      setDeleteReason('');
                      setDeleteConfirmText('');
                    }}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Remove Shipper / Customer (Admin Only)"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Contract Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-[#dce9ff] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  {selectedCustomer.name}
                </h3>
                <span className="font-label-code text-[11px] text-outline">
                  Contract Agreement • Valid until {selectedCustomer.contractExpiry}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-3 bg-surface-container-low rounded-xl space-y-1">
                <span className="text-[11px] text-outline font-semibold uppercase block">Billing Protocol</span>
                <div className="flex justify-between">
                  <span>Settlement Currency:</span>
                  <span className="font-bold text-on-surface">{selectedCustomer.billingCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Facility:</span>
                  <span className="font-bold text-on-surface">Net {selectedCustomer.creditDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Channel:</span>
                  <span className="font-bold text-primary">SWIFT pacs.008 MT103</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl space-y-1">
                <span className="text-[11px] text-outline font-semibold uppercase block">Authorized Contacts</span>
                <div>Name: <strong>{selectedCustomer.contactPerson}</strong></div>
                <div>Phone: <strong>{selectedCustomer.phone}</strong></div>
                <div>Email: <strong>{selectedCustomer.email}</strong></div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              {(role === 'super_admin' || permissions.canDeleteRecords) ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedCustomer;
                    setSelectedCustomer(null);
                    setCustomerToDelete(target);
                    setDeleteReason('');
                    setDeleteConfirmText('');
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-body-sm text-[12px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  Remove Shipper
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-primary text-white rounded-xl font-body-sm text-[12px] font-medium"
              >
                Close Agreement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audited Customer / Shipper Removal Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-rose-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-rose-900">
                    Audited Shipper Removal
                  </h3>
                  <span className="font-label-code text-[11px] text-outline">
                    Admin Governance • Soft-Delete & Audit Rationale
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCustomerToDelete(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-[12px] space-y-1.5">
              <div className="font-bold text-on-surface text-[13px]">{customerToDelete.name}</div>
              <div className="text-outline">TIN: <span className="font-mono text-on-surface">{customerToDelete.tinNumber}</span> • Corridor: {customerToDelete.corridor}</div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-outline">Outstanding Exposure:</span>
                <span className={`font-mono font-bold ${customerToDelete.outstandingArUsd > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  ${customerToDelete.outstandingArUsd.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Active Trips:</span>
                <span className="font-bold text-on-surface">{customerToDelete.activeTrips} Active Waybills</span>
              </div>
            </div>

            {(customerToDelete.outstandingArUsd > 0 || customerToDelete.activeTrips > 0) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">warning</span>
                <div>
                  <strong>Operational & Financial Notice:</strong> This shipper has active corridor shipments or outstanding receivables. Removal will archive the commercial account while retaining all historical transactions in the immutable ledger.
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!deleteReason.trim()) {
                  triggerToast('Error: Mandatory audit justification is required to delete this customer.');
                  return;
                }
                if (customerToDelete.outstandingArUsd > 0 && deleteConfirmText !== 'DELETE') {
                  triggerToast('Error: Please type DELETE to confirm removal of customer with open AR.');
                  return;
                }
                if (onDeleteCustomer) {
                  onDeleteCustomer(customerToDelete.id, deleteReason);
                }
                triggerToast(`Customer "${customerToDelete.name}" removed and logged to audit trail.`);
                setCustomerToDelete(null);
                setDeleteReason('');
                setDeleteConfirmText('');
              }}
              className="space-y-3 text-[12px]"
            >
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Mandatory Administrator Rationale *
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Explain reason for customer removal (e.g. Contract terminated, off-taker insolvency, merged account)..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              {customerToDelete.outstandingArUsd > 0 && (
                <div>
                  <label className="block font-label-sm text-[11px] font-semibold text-rose-700 uppercase mb-1">
                    Type DELETE to Confirm *
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-rose-300 text-on-surface font-mono font-bold focus:outline-none focus:border-rose-600"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCustomerToDelete(null)}
                  className="px-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-sm text-[12px] font-medium hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-body-sm text-[12px] font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Confirm Deletion & Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCustomer={(newCust) => {
          onAddCustomer(newCust);
          triggerToast(`Registered new customer: ${newCust.name}!`);
        }}
      />
    </div>
  );
};
