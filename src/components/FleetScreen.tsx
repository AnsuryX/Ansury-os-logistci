import React, { useState } from 'react';
import { Vehicle } from '../types';
import { AddVehicleModal } from './AddVehicleModal';
import { useAuth } from '../lib/auth';

interface FleetScreenProps {
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (vehicleIdOrReg: string, reason: string) => void;
  onDeleteDriver?: (driverIdOrName: string, reason: string) => void;
  viewMode?: 'fleet' | 'drivers' | 'fuel';
}

export const FleetScreen: React.FC<FleetScreenProps> = ({
  vehicles,
  onAddVehicle,
  onDeleteVehicle,
  onDeleteDriver,
  viewMode = 'fleet',
}) => {
  const { role, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [vehicleDeleteReason, setVehicleDeleteReason] = useState('');
  const [driverToDelete, setDriverToDelete] = useState<Vehicle | null>(null);
  const [driverDeleteReason, setDriverDeleteReason] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'drivers' | 'fuel'>(viewMode);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.corridor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFuelKes = vehicles.reduce((acc, v) => acc + v.fuelCostKes, 0);
  const activeCount = vehicles.filter((v) => v.status === 'Active').length;
  const anomalyCount = vehicles.filter((v) => v.status === 'Anomaly').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'Maintenance').length;

  return (
    <div className="p-space-lg space-y-space-lg pb-24">
      {/* Toast Notification */}
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
              FLEET TELEMATICS & TRACKING
            </span>
            <span className="font-label-code text-[11px] text-outline">
              Corridor GPS Tracking & Fleet Fuel Monitoring
            </span>
          </div>

          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight mt-1">
            {activeSubTab === 'fleet'
              ? 'Vehicles & Prime Movers'
              : activeSubTab === 'drivers'
              ? 'Drivers & Fleet Operators'
              : 'Fuel Control & Card Log'}
          </h1>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            {vehicles.length} Heavy Haulage Assets • Real-time fuel burn rates, GPS geofencing & driver allowance balances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-view toggle tabs */}
          <div className="bg-surface-container-low p-1 rounded-xl border border-[#dce9ff] flex items-center">
            <button
              onClick={() => setActiveSubTab('fleet')}
              className={`px-3 py-1 rounded-lg font-body-sm text-[12px] font-semibold transition-all ${
                activeSubTab === 'fleet' ? 'bg-primary text-white shadow-sm' : 'text-outline hover:text-on-surface'
              }`}
            >
              Vehicles
            </button>
            <button
              onClick={() => setActiveSubTab('drivers')}
              className={`px-3 py-1 rounded-lg font-body-sm text-[12px] font-semibold transition-all ${
                activeSubTab === 'drivers' ? 'bg-primary text-white shadow-sm' : 'text-outline hover:text-on-surface'
              }`}
            >
              Drivers
            </button>
            <button
              onClick={() => setActiveSubTab('fuel')}
              className={`px-3 py-1 rounded-lg font-body-sm text-[12px] font-semibold transition-all ${
                activeSubTab === 'fuel' ? 'bg-primary text-white shadow-sm' : 'text-outline hover:text-on-surface'
              }`}
            >
              Fuel Cards
            </button>
          </div>

          {role === 'driver' ? (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-body-sm text-[12px] font-semibold flex items-center gap-1.5 border border-slate-200">
              <span className="material-symbols-outlined text-[16px] text-slate-500">visibility</span>
              <span>Driver (Read-Only)</span>
            </div>
          ) : (
            <button
              disabled={!permissions.canEditFleet}
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-[12px] font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Fleet Asset
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Total Fleet Registered</span>
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
            {vehicles.length} Assets
          </div>
          <div className="mt-2 text-[11px] text-outline">
            {activeCount} In Transit • {maintenanceCount} In Yard
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">MTD Fuel Expenditure</span>
            <span className="material-symbols-outlined text-amber-700 text-[20px]">local_gas_station</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
            KES {totalFuelKes.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-outline">
            Across TotalEnergies & Rubis fuel cards
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Telematics Anomalies</span>
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-error mt-2">
            {anomalyCount} Flagged
          </div>
          <div className="mt-2 text-[11px] text-outline">
            High burn rates on Eldoret escarpment
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Fleet Fuel Average</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">speed</span>
          </div>
          <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
            2.38 km/L
          </div>
          <div className="mt-2 text-[11px] text-outline">
            Target benchmark: 2.40 km/L
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
            placeholder="Search plate number, driver, model, route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface-container-low rounded-xl font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-surface-container-low rounded-xl font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none"
          >
            <option value="all">All Operating Statuses</option>
            <option value="Active">Active (In Transit)</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Completed">Ready for Dispatch</option>
            <option value="Anomaly">Anomaly Flagged</option>
          </select>

          <span className="font-label-code text-[11px] text-outline px-2 whitespace-nowrap">
            Showing {filteredVehicles.length} of {vehicles.length}
          </span>
        </div>
      </div>

      {/* Main Grid View */}
      {activeSubTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-surface-container-lowest rounded-2xl p-5 border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                <div>
                  <span className="font-label-code text-[15px] font-bold text-on-surface block">
                    {v.reg}
                  </span>
                  <div className="font-body-sm text-[11px] text-outline">{v.makeModel}</div>
                </div>
                <span
                  className={`font-label-code text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    v.status === 'Anomaly'
                      ? 'bg-error-container text-on-error-container'
                      : v.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-900'
                      : v.status === 'Completed'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-outline">Assigned Operator:</span>
                  <span className="font-semibold text-on-surface">
                    {v.driver} ({v.driverId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Active Route:</span>
                  <span className="text-on-surface text-right truncate max-w-[200px]">{v.corridor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Fuel Efficiency:</span>
                  <span
                    className={`font-label-numeric font-bold ${
                      v.efficiencyPct < 0 ? 'text-error' : 'text-tertiary'
                    }`}
                  >
                    {v.actualKmL > 0 ? `${v.actualKmL} km/L` : 'In Yard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">MTD Fuel Spend:</span>
                  <span className="font-label-numeric font-bold text-on-surface">
                    KES {v.fuelCostKes.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
                <span className="text-tertiary flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  GPS Tracking Online
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedVehicle(v);
                      triggerToast(`Opening diagnostic telemetry for ${v.reg}`);
                    }}
                    className="text-primary font-semibold hover:underline font-label-code"
                  >
                    Diagnostic Log →
                  </button>
                  {(role === 'super_admin' || permissions.canDeleteRecords) && (
                    <button
                      type="button"
                      onClick={() => {
                        setVehicleToDelete(v);
                        setVehicleDeleteReason('');
                      }}
                      className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Decommission & Remove Vehicle Asset (Admin Only)"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drivers Sub-view */}
      {activeSubTab === 'drivers' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-[10px] text-outline uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-3 px-4">Operator Name</th>
                <th className="py-3 px-4">Driver ID</th>
                <th className="py-3 px-4">Assigned Prime Mover</th>
                <th className="py-3 px-4">Active Corridor Route</th>
                <th className="py-3 px-4">Corridor Status</th>
                <th className="py-3 px-4 text-right">Fuel Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-on-surface flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                      {v.driverInitials}
                    </div>
                    <span>{v.driver}</span>
                  </td>
                  <td className="py-3 px-4 font-label-code text-outline">{v.driverId}</td>
                  <td className="py-3 px-4 font-label-code font-bold text-primary">{v.reg}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{v.corridor}</td>
                  <td className="py-3 px-4">
                    <span className="font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-label-numeric font-bold text-tertiary">
                    {v.efficiencyPct > 0 ? `+${v.efficiencyPct}%` : `${v.efficiencyPct}%`}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {(role === 'super_admin' || permissions.canDeleteRecords) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDriverToDelete(v);
                          setDriverDeleteReason('');
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Remove Driver from Fleet Roster"
                      >
                        <span className="material-symbols-outlined text-[13px]">person_remove</span>
                        <span>Remove</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fuel Cards Sub-view */}
      {activeSubTab === 'fuel' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-[10px] text-outline uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Fuel Card Provider</th>
                <th className="py-3 px-4">Card Identifier</th>
                <th className="py-3 px-4">Efficiency (km/L)</th>
                <th className="py-3 px-4 text-right">MTD Fuel Outlay</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredVehicles.map((v, i) => (
                <tr key={v.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-label-code font-bold text-on-surface">{v.reg}</td>
                  <td className="py-3 px-4 font-medium text-on-surface">
                    {i % 2 === 0 ? 'TotalEnergies Card Pro' : 'Rubis Energy Pass'}
                  </td>
                  <td className="py-3 px-4 font-label-code text-outline">
                    7008-9412-***-{1000 + i * 42}
                  </td>
                  <td className="py-3 px-4 font-label-numeric font-bold text-tertiary">
                    {v.actualKmL} km/L
                  </td>
                  <td className="py-3 px-4 text-right font-label-numeric font-bold text-on-surface">
                    KES {v.fuelCostKes.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => triggerToast(`Top-up float authorization initiated for ${v.reg}`)}
                      className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-label-code text-[11px] font-bold"
                    >
                      Top-Up Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Diagnostics Drawer Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-[#dce9ff] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  {selectedVehicle.reg} Diagnostic Telemetry
                </h3>
                <span className="font-label-code text-[11px] text-outline">
                  {selectedVehicle.makeModel} • Telemetry & GPS Stream
                </span>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-3 bg-surface-container-low rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-outline">Engine Coolant Temp:</span>
                  <span className="font-bold text-on-surface">88°C (Normal)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Oil Pressure:</span>
                  <span className="font-bold text-on-surface">4.2 Bar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">ECU Fault Codes:</span>
                  <span className="font-bold text-emerald-800">0 Active DTCs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">GPS Location:</span>
                  <span className="font-bold text-primary">{selectedVehicle.tripLocation}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              {(role === 'super_admin' || permissions.canDeleteRecords) ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedVehicle;
                    setSelectedVehicle(null);
                    setVehicleToDelete(target);
                    setVehicleDeleteReason('');
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-body-sm text-[12px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  Decommission Asset
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 bg-primary text-white rounded-xl font-body-sm text-[12px] font-medium"
              >
                Close Telematics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audited Vehicle Asset Decommission / Removal Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-rose-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">no_crash</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-rose-900">
                    Decommission Fleet Asset
                  </h3>
                  <span className="font-label-code text-[11px] text-outline">
                    Admin Governance • Audit-Grade Equipment Removal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setVehicleToDelete(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-[12px] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-on-surface text-[14px] text-primary">{vehicleToDelete.reg}</span>
                <span className="font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-800">
                  {vehicleToDelete.status}
                </span>
              </div>
              <div className="text-outline">{vehicleToDelete.makeModel} • Driver: <strong className="text-on-surface">{vehicleToDelete.driver}</strong></div>
              <div className="text-[11px] text-outline">Corridor: {vehicleToDelete.corridor}</div>
            </div>

            {vehicleToDelete.status === 'Active' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">warning</span>
                <div>
                  <strong>Active Corridor Haulage Alert:</strong> This prime mover is currently flagged as In-Transit. Decommissioning will unassign active waybill links and write an immutable audit record.
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!vehicleDeleteReason.trim()) {
                  triggerToast('Error: Mandatory audit justification is required to decommission this vehicle.');
                  return;
                }
                if (onDeleteVehicle) {
                  onDeleteVehicle(vehicleToDelete.id, vehicleDeleteReason);
                }
                triggerToast(`Asset ${vehicleToDelete.reg} decommissioned. Audit log written.`);
                setVehicleToDelete(null);
                setVehicleDeleteReason('');
              }}
              className="space-y-3 text-[12px]"
            >
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Mandatory Decommission Rationale *
                </label>
                <textarea
                  rows={3}
                  value={vehicleDeleteReason}
                  onChange={(e) => setVehicleDeleteReason(e.target.value)}
                  placeholder="Reason for asset removal (e.g. Asset sold, total loss insurance write-off, lease expired, transferred)..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVehicleToDelete(null)}
                  className="px-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-sm text-[12px] font-medium hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-body-sm text-[12px] font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Confirm Decommission & Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audited Driver Roster Removal Modal */}
      {driverToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-rose-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_remove</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-rose-900">
                    Remove Driver from Roster
                  </h3>
                  <span className="font-label-code text-[11px] text-outline">
                    Admin Governance • Driver Profile Revocation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDriverToDelete(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-[12px] space-y-1.5">
              <div className="font-bold text-on-surface text-[13px]">{driverToDelete.driver}</div>
              <div className="text-outline">Driver ID: <span className="font-mono text-on-surface">{driverToDelete.driverId}</span></div>
              <div className="text-outline">Assigned Prime Mover: <span className="font-mono font-bold text-primary">{driverToDelete.reg}</span></div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1">
              <span className="font-bold block">Operator Roster Notice:</span>
              <p>
                Removing this operator unassigns them from prime mover {driverToDelete.reg} and revokes their active corridor driver status. Historical fuel and voucher telemetry will remain intact in the immutable audit log.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!driverDeleteReason.trim()) {
                  triggerToast('Error: Mandatory audit justification is required to remove this driver.');
                  return;
                }
                if (onDeleteDriver) {
                  onDeleteDriver(driverToDelete.driverId || driverToDelete.driver, driverDeleteReason);
                }
                triggerToast(`Driver "${driverToDelete.driver}" removed from fleet roster.`);
                setDriverToDelete(null);
                setDriverDeleteReason('');
              }}
              className="space-y-3 text-[12px]"
            >
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Mandatory Removal Rationale *
                </label>
                <textarea
                  rows={3}
                  value={driverDeleteReason}
                  onChange={(e) => setDriverDeleteReason(e.target.value)}
                  placeholder="Specify reason for driver removal (e.g. Contract terminated, resignation, transfer to third-party sub-contractor)..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDriverToDelete(null)}
                  className="px-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-sm text-[12px] font-medium hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-body-sm text-[12px] font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">person_remove</span>
                  Confirm Driver Removal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fleet Asset Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddVehicle={(newVeh) => {
          onAddVehicle(newVeh);
          triggerToast(`Registered new fleet asset: ${newVeh.reg} (${newVeh.makeModel})!`);
        }}
      />
    </div>
  );
};
