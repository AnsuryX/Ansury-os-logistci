import React, { useState } from 'react';
import { TripDispatch, Vehicle, Customer } from '../types';
import { downloadCsv } from '../utils/format';
import { useAuth } from '../lib/auth';

interface TripsScreenProps {
  trips: TripDispatch[];
  vehicles: Vehicle[];
  customers: Customer[];
  onAddTrip: (trip: TripDispatch) => void;
  onUpdateTripStatus: (tripId: string, status: TripDispatch['status']) => void;
  onDeleteTrip?: (tripId: string, reason: string) => void;
  initialOpenCreateModal?: boolean;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({
  trips,
  vehicles,
  customers,
  onAddTrip,
  onUpdateTripStatus,
  onDeleteTrip,
  initialOpenCreateModal = false,
}) => {
  const { role, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Transit' | 'Customs Hold' | 'Discharging' | 'Completed'>('all');
  const [cargoFilter, setCargoFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialOpenCreateModal);
  const [selectedDocketTrip, setSelectedDocketTrip] = useState<TripDispatch | null>(null);
  const [tripToDelete, setTripToDelete] = useState<TripDispatch | null>(null);
  const [tripDeleteReason, setTripDeleteReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for New Dispatch
  const [shipper, setShipper] = useState('');
  const [origin, setOrigin] = useState('Nairobi ICD (Embakasi)');
  const [destination, setDestination] = useState('Kampala Industrial Area (Nakawa)');
  const [corridor, setCorridor] = useState('Northern Corridor (Malaba OSBP)');
  const [cargo, setCargo] = useState('');
  const [cargoType, setCargoType] = useState<TripDispatch['cargoType']>('Liquid Bulk / Fuel');
  const [selectedTruckReg, setSelectedTruckReg] = useState(vehicles[0]?.reg || 'KDA 542T');
  const [driverName, setDriverName] = useState(vehicles[0]?.driver || 'Joseph Mwangi');
  const [driverPhone, setDriverPhone] = useState('+254 722 491 802');
  const [grossKes, setGrossKes] = useState('380000');
  const [fuelAdvanceKes, setFuelAdvanceKes] = useState('95000');
  const [driverAllowanceKes, setDriverAllowanceKes] = useState('22000');
  const [targetEta, setTargetEta] = useState('Tomorrow 18:00 EAT');
  const [notes, setNotes] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync driver name when truck changes
  const handleTruckChange = (reg: string) => {
    setSelectedTruckReg(reg);
    const foundVeh = vehicles.find((v) => v.reg === reg);
    if (foundVeh) {
      setDriverName(foundVeh.driver);
    }
  };

  // Filtered trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.truckReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.shipper.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesCargo = cargoFilter === 'all' || trip.cargoType === cargoFilter;

    return matchesSearch && matchesStatus && matchesCargo;
  });

  // KPI Calculations
  const activeDispatches = trips.filter((t) => t.status === 'In Transit' || t.status === 'Customs Hold' || t.status === 'Discharging').length;
  const inTransitCount = trips.filter((t) => t.status === 'In Transit').length;
  const customsHoldCount = trips.filter((t) => t.status === 'Customs Hold').length;
  const completedCount = trips.filter((t) => t.status === 'Completed').length;
  const totalValueInTransitKes = trips
    .filter((t) => t.status !== 'Completed')
    .reduce((sum, t) => sum + t.grossValueKes, 0);

  const handleCreateManifest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargo.trim()) {
      triggerToast('Error: Please enter cargo description.');
      return;
    }

    const matchedVeh = vehicles.find((v) => v.reg === selectedTruckReg);
    const parsedKes = parseFloat(grossKes) || 350000;
    const parsedUsd = Math.round(parsedKes / 132.5);
    const newTripId = `TRP-0${Math.floor(250 + Math.random() * 50)}`;
    const newWaybill = `WB-2026-${Math.floor(950 + Math.random() * 50)}`;

    const newTrip: TripDispatch = {
      id: newTripId,
      waybillNumber: newWaybill,
      route: `${origin.split(' ')[0]} → ${destination.split(' ')[0]}`,
      corridor,
      origin,
      destination,
      shipper: shipper || customers[0]?.name || 'Vivo Energy Uganda',
      cargo,
      cargoType,
      truckReg: selectedTruckReg,
      truckModel: matchedVeh?.makeModel || 'Prime Mover 6x4',
      driverName,
      driverPhone,
      status: 'In Transit',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      progressPct: 15,
      eta: targetEta,
      grossValueKes: parsedKes,
      grossValueUsd: parsedUsd,
      fuelAdvanceKes: parseFloat(fuelAdvanceKes) || 0,
      driverAllowanceKes: parseFloat(driverAllowanceKes) || 0,
      startDate: new Date().toISOString().split('T')[0],
      notes: notes || 'GPS tracking activated. Weighbridge compliance enforced at Webuye & Gilgil.',
    };

    onAddTrip(newTrip);
    triggerToast(`Dispatch Manifest ${newWaybill} created for ${newTrip.truckReg}! Dispatched along ${corridor}.`);
    setIsCreateModalOpen(false);

    // Reset fields
    setCargo('');
    setNotes('');
  };

  const handleExportTrips = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const headers = [
      'Trip ID',
      'Waybill Number',
      'Origin',
      'Destination',
      'Corridor Checkpoints',
      'Shipper / Consignor',
      'Cargo Description',
      'Cargo Classification',
      'Truck Registration',
      'Truck Model',
      'Assigned Driver',
      'Driver Contact',
      'Dispatch Status',
      'Progress %',
      'Target ETA',
      'Gross Freight Value (KES)',
      'Gross Value (USD)',
      'Fuel Advance (KES)',
      'Driver Allowance (KES)',
      'Dispatch Date',
    ];

    const rows = filteredTrips.map((t) => [
      t.id,
      t.waybillNumber,
      t.origin,
      t.destination,
      t.corridor,
      t.shipper,
      t.cargo,
      t.cargoType,
      t.truckReg,
      t.truckModel,
      t.driverName,
      t.driverPhone || 'N/A',
      t.status,
      `${t.progressPct}%`,
      t.eta,
      t.grossValueKes,
      t.grossValueUsd,
      t.fuelAdvanceKes || 0,
      t.driverAllowanceKes || 0,
      t.startDate,
    ]);

    downloadCsv(`Ansury_Corridor_Trips_Manifests_${dateStr}.csv`, [headers, ...rows]);
    triggerToast(`Exported ${filteredTrips.length} dispatch manifests to CSV!`);
  };

  const getStatusBadge = (status: TripDispatch['status']) => {
    switch (status) {
      case 'In Transit':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Customs Hold':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Discharging':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Completed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Delayed':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              Operations & Logistics / Corridor Waybill Management
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Trips & Dispatches
            </h1>
            <span className="font-label-code text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Northern Corridor Telematics Live
            </span>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Active haulage manifests, border clearance checkpoints (Malaba/Busia/Katuna OSBP), and live waybill turnaround.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportTrips}
            className="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            title="Download Corridor Trips CSV"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Export Manifests (.csv)
          </button>

          {role !== 'driver' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create Dispatch Manifest
            </button>
          )}
        </div>
      </div>

      {/* 4 Operations KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Active Corridor Trips
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">alt_route</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              {activeDispatches} Dispatches
            </div>
          </div>
          <div className="mt-2 text-[11px] font-label-code text-outline">
            {inTransitCount} Rolling • {customsHoldCount} Border Holds
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Freight Value in Transit
              </span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">payments</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
              KES {totalValueInTransitKes.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[11px] font-label-code text-outline">
            ~ ${(totalValueInTransitKes / 132.5).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Customs & Border Holds
              </span>
              <span className="material-symbols-outlined text-amber-600 text-[20px]">gavel</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-amber-700 mt-2">
              {customsHoldCount} Trucks
            </div>
          </div>
          <div className="mt-2 text-[11px] font-label-code text-amber-600 font-semibold">
            Malaba OSBP & Busia border queue
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Delivered / Completed
              </span>
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-emerald-700 mt-2">
              {completedCount} Dispatches
            </div>
          </div>
          <div className="mt-2 text-[11px] font-label-code text-outline">
            PODs archived & invoiced
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'In Transit', 'Customs Hold', 'Discharging', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-lowest text-outline hover:text-on-surface border border-[#dce9ff]'
              }`}
            >
              {st === 'all' ? `All Dispatches (${trips.length})` : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
            className="h-9 px-3 bg-surface-container-lowest rounded-xl font-body-sm text-[12px] text-on-surface border border-[#dce9ff] focus:outline-none"
          >
            <option value="all">All Cargo Types</option>
            <option value="Liquid Bulk / Fuel">Liquid Bulk / Fuel</option>
            <option value="Containerized">Containerized</option>
            <option value="Dry Bulk">Dry Bulk</option>
            <option value="General Freight">General Freight</option>
          </select>

          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Search Waybill, Plate, Driver, Route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-surface-container-lowest rounded-xl font-body-sm text-[12px] text-on-surface placeholder:text-outline border border-[#dce9ff] focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-code text-[12px] font-bold text-primary">
                    {trip.id}
                  </span>
                  <span className="font-label-code text-[11px] bg-surface-container-low px-1.5 py-0.5 rounded text-outline font-semibold">
                    {trip.waybillNumber}
                  </span>
                </div>
                <div className="font-headline-sm text-[15px] font-bold text-on-surface mt-0.5">
                  {trip.route}
                </div>
                <div className="text-[11px] text-outline font-label-code">
                  {trip.corridor}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`font-label-code text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(trip.status)}`}>
                  {trip.status}
                </span>

                {/* Status Quick Update Menu */}
                {role !== 'driver' && (
                  <select
                    value={trip.status}
                    onChange={(e) => onUpdateTripStatus(trip.id, e.target.value as TripDispatch['status'])}
                    className="text-[10px] bg-surface-container-low border border-[#dce9ff] rounded px-1.5 py-0.5 text-on-surface font-semibold focus:outline-none"
                  >
                    <option value="In Transit">In Transit</option>
                    <option value="Customs Hold">Customs Hold</option>
                    <option value="Discharging">Discharging</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-2.5 rounded-xl">
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Shipper / Client</span>
                <span className="font-semibold text-on-surface truncate block">{trip.shipper}</span>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Cargo</span>
                <span className="text-on-surface truncate block font-medium">{trip.cargo}</span>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Truck & Driver</span>
                <span className="font-label-code text-on-surface font-bold block">{trip.truckReg}</span>
                <span className="text-outline text-[11px]">{trip.driverName}</span>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Gross Contract Value</span>
                <span className="font-label-numeric font-bold text-primary block">
                  KES {trip.grossValueKes.toLocaleString()}
                </span>
                <span className="text-outline text-[10px] font-label-code">
                  ~ ${trip.grossValueUsd.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Corridor Progress */}
            <div>
              <div className="flex justify-between text-[11px] text-outline mb-1 font-label-code">
                <span>Corridor Progress</span>
                <span className="font-bold text-on-surface">{trip.progressPct}% (ETA: {trip.eta})</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    trip.status === 'Completed'
                      ? 'bg-emerald-600'
                      : trip.status === 'Customs Hold'
                      ? 'bg-amber-500'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${trip.progressPct}%` }}
                ></div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
              <span className="text-outline truncate max-w-[200px]">
                {trip.notes || `Dispatched ${trip.startDate}`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedDocketTrip(trip)}
                  className="px-2.5 py-1 rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-white font-label-code text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">description</span>
                  View Waybill Docket
                </button>
                {(role === 'super_admin' || permissions.canDeleteRecords) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTripToDelete(trip);
                      setTripDeleteReason('');
                    }}
                    className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Cancel & Delete Dispatch Manifest (Admin Only)"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-[#dce9ff] text-outline space-y-2">
          <span className="material-symbols-outlined text-[48px] text-outline/50">alt_route</span>
          <p className="font-body-md text-on-surface font-semibold">No dispatch manifests match your filter criteria.</p>
          <p className="font-body-sm text-[12px] text-outline">Clear filters or create a new corridor transit manifest.</p>
        </div>
      )}

      {/* CREATE DISPATCH MANIFEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_road</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Create New Corridor Dispatch Manifest
                  </h3>
                  <p className="font-label-sm text-[11px] text-outline">
                    Northern & Central Corridor Transit Docket • OSBP Customs Tracking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateManifest} className="p-space-lg space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Shipper */}
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Shipper / Customer
                  </label>
                  <select
                    value={shipper}
                    onChange={(e) => setShipper(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Shipper...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.corridor})
                      </option>
                    ))}
                    <option value="Vivo Energy Uganda">Vivo Energy Uganda</option>
                    <option value="Mukwano Industries">Mukwano Industries</option>
                    <option value="TotalEnergies Marketing Kenya">TotalEnergies Marketing Kenya</option>
                    <option value="Bralirwa Brewery Rwanda">Bralirwa Brewery Rwanda</option>
                  </select>
                </div>

                {/* Corridor */}
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Transit Corridor
                  </label>
                  <select
                    value={corridor}
                    onChange={(e) => setCorridor(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  >
                    <option value="Northern Corridor (Malaba OSBP)">Northern Corridor (Malaba OSBP)</option>
                    <option value="Northern Corridor (Busia OSBP)">Northern Corridor (Busia OSBP)</option>
                    <option value="Western Kenya Highway (A104)">Western Kenya Highway (A104)</option>
                    <option value="Mombasa-Nairobi A109 Highway">Mombasa-Nairobi A109 Highway</option>
                    <option value="Central Corridor via Katuna OSBP (Rwanda)">Central Corridor via Katuna OSBP (Rwanda)</option>
                    <option value="South Sudan Corridor via Nimule / Elegu">South Sudan Corridor via Nimule / Elegu</option>
                  </select>
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Origin / Loading Depot
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Mombasa Port Berth 19"
                    required
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Destination / Offloading Point
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Kampala Industrial Area"
                    required
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Cargo Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Cargo Description & Quantity
                  </label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="e.g. 36,000 L Low Sulphur Gasoil"
                    required
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Cargo Classification
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value as TripDispatch['cargoType'])}
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  >
                    <option value="Liquid Bulk / Fuel">Liquid Bulk / Fuel</option>
                    <option value="Containerized">Containerized</option>
                    <option value="Dry Bulk">Dry Bulk</option>
                    <option value="General Freight">General Freight</option>
                  </select>
                </div>
              </div>

              {/* Truck & Driver Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Assigned Fleet Prime Mover
                  </label>
                  <select
                    value={selectedTruckReg}
                    onChange={(e) => handleTruckChange(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary font-bold"
                  >
                    {vehicles.map((v) => (
                      <option key={v.reg} value={v.reg}>
                        {v.reg} • {v.makeModel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Assigned Driver
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Driver Phone Contact
                  </label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Agreed Freight Rates & Allowances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Gross Freight Rate (KES)
                  </label>
                  <input
                    type="number"
                    value={grossKes}
                    onChange={(e) => setGrossKes(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary font-bold"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Fuel Advance (KES)
                  </label>
                  <input
                    type="number"
                    value={fuelAdvanceKes}
                    onChange={(e) => setFuelAdvanceKes(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                    Target Delivery ETA
                  </label>
                  <input
                    type="text"
                    value={targetEta}
                    onChange={(e) => setTargetEta(e.target.value)}
                    placeholder="e.g. Tomorrow 18:00 EAT"
                    className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Transit Notes */}
              <div>
                <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                  Customs Seal / Special Instructions
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Electronic Cargo Tracking System (ECTS) seal attached at Kilindini."
                  className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-[13px] border border-[#dce9ff] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#dce9ff] text-on-surface hover:bg-surface-container text-[12px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container font-semibold text-[12px] shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Issue & Dispatch Waybill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW WAYBILL DOCKET MODAL */}
      {selectedDocketTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDocketTrip(null)}></div>
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">assignment</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Corridor Transit Waybill Docket #{selectedDocketTrip.waybillNumber}
                  </h3>
                  <p className="font-label-sm text-[11px] text-outline">
                    Trip Reference: {selectedDocketTrip.id} • Northern Corridor OSBP Cleared
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocketTrip(null)}
                className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Docket Document Sheet */}
            <div className="p-space-lg space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-4 bg-[#fffdf7] border border-[#e2d7c0] rounded-xl font-mono text-[11px] text-slate-800 space-y-3 shadow-inner">
                <div className="flex justify-between items-start pb-2 border-b border-dashed border-[#c7b99c]">
                  <div>
                    <div className="font-bold text-[14px] text-slate-900">ANSURY LOGISTICS LIMITED</div>
                    <div>EAST AFRICAN FREIGHT & TANKER EXPEDITION</div>
                    <div>PIN: P051398214M • REG: CPR/2021/8921</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[13px] text-primary">{selectedDocketTrip.waybillNumber}</div>
                    <div>DISPATCH DATE: {selectedDocketTrip.startDate}</div>
                    <div className="text-emerald-700 font-bold">STATUS: {selectedDocketTrip.status.toUpperCase()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-2 border-b border-dashed border-[#c7b99c]">
                  <div>
                    <div className="text-slate-500 uppercase font-bold text-[9px]">CONSIGNOR / SHIPPER:</div>
                    <div className="font-bold text-[12px]">{selectedDocketTrip.shipper}</div>
                    <div>ORIGIN: {selectedDocketTrip.origin}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase font-bold text-[9px]">CONSIGNEE / DESTINATION:</div>
                    <div className="font-bold text-[12px]">{selectedDocketTrip.destination}</div>
                    <div>TRANSIT: {selectedDocketTrip.corridor}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-dashed border-[#c7b99c]">
                  <div>
                    <div className="text-slate-500 uppercase font-bold text-[9px]">PRIME MOVER:</div>
                    <div className="font-bold">{selectedDocketTrip.truckReg}</div>
                    <div className="text-[10px] text-slate-600">{selectedDocketTrip.truckModel}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase font-bold text-[9px]">DRIVER:</div>
                    <div className="font-bold">{selectedDocketTrip.driverName}</div>
                    <div className="text-[10px] text-slate-600">{selectedDocketTrip.driverPhone || 'Radio Comm Active'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase font-bold text-[9px]">CARGO TYPE:</div>
                    <div className="font-bold">{selectedDocketTrip.cargoType}</div>
                    <div className="text-[10px] text-slate-600">{selectedDocketTrip.cargo}</div>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-[#d9ccb0] space-y-1">
                  <div className="flex justify-between font-bold text-[12px]">
                    <span>AGREED FREIGHT CONTRACT:</span>
                    <span className="text-primary font-mono">KES {selectedDocketTrip.grossValueKes.toLocaleString()} (~${selectedDocketTrip.grossValueUsd.toLocaleString()} USD)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>M-Pesa Fuel Float Advance:</span>
                    <span>KES {(selectedDocketTrip.fuelAdvanceKes || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Driver Corridor Transit Allowance:</span>
                    <span>KES {(selectedDocketTrip.driverAllowanceKes || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-600">
                  <div><strong>Special Instructions:</strong> {selectedDocketTrip.notes}</div>
                  <div className="mt-1">Verified against GPS CANBUS Gateway. Weighbridge tolerance 0.0% overload.</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-t border-[#e5eeff]">
              <div className="flex items-center gap-2">
                {(role === 'super_admin' || permissions.canDeleteRecords) && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedDocketTrip;
                      setSelectedDocketTrip(null);
                      setTripToDelete(target);
                      setTripDeleteReason('');
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-body-sm text-[12px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    Cancel & Remove Waybill
                  </button>
                )}
                <span className="text-[11px] font-label-code text-outline hidden sm:inline">
                  Signed electronically by Carrier & Consignor Dispatcher
                </span>
              </div>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-[12px] shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Transit Waybill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audited Trip / Waybill Removal Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-rose-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-rose-900">
                    Cancel & Remove Dispatch Manifest
                  </h3>
                  <span className="font-label-code text-[11px] text-outline">
                    Admin Governance • Northern Corridor Waybill Cancellation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setTripToDelete(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-[12px] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-primary text-[13px]">{tripToDelete.waybillNumber}</span>
                <span className="font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-800">
                  {tripToDelete.status}
                </span>
              </div>
              <div className="text-on-surface font-medium">{tripToDelete.route} ({tripToDelete.corridor})</div>
              <div className="text-outline">Shipper: <strong className="text-on-surface">{tripToDelete.shipper}</strong> • Truck: {tripToDelete.truckReg}</div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px]">
                <span>Contract Value:</span>
                <span className="font-mono font-bold text-on-surface">KES {tripToDelete.grossValueKes.toLocaleString()}</span>
              </div>
            </div>

            {tripToDelete.status === 'In Transit' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">warning</span>
                <div>
                  <strong>Active Rolling Transit Notice:</strong> This waybill is recorded as actively rolling in transit. Removing this manifest will cancel driver route clearance and write an immutable audit log.
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!tripDeleteReason.trim()) {
                  triggerToast('Error: Mandatory audit rationale is required to cancel this dispatch manifest.');
                  return;
                }
                if (onDeleteTrip) {
                  onDeleteTrip(tripToDelete.id, tripDeleteReason);
                }
                triggerToast(`Waybill manifest ${tripToDelete.waybillNumber} cancelled & removed from active roster.`);
                setTripToDelete(null);
                setTripDeleteReason('');
              }}
              className="space-y-3 text-[12px]"
            >
              <div>
                <label className="block font-label-sm text-[11px] font-semibold text-outline uppercase mb-1">
                  Mandatory Cancellation Rationale *
                </label>
                <textarea
                  rows={3}
                  value={tripDeleteReason}
                  onChange={(e) => setTripDeleteReason(e.target.value)}
                  placeholder="Specify reason for cancelling manifest (e.g. Shipper cancelled order, customs clearance revoked, duplicate waybill entry)..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTripToDelete(null)}
                  className="px-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-sm text-[12px] font-medium hover:bg-surface-container transition-colors"
                >
                  Keep Manifest
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-body-sm text-[12px] font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Confirm Cancellation & Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
