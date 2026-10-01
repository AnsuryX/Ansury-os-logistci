import React, { useState } from 'react';
import { Vehicle, TripDispatch, ExpenseClaim } from '../types';
import { useAuth } from '../lib/auth';

interface DriverDashboardScreenProps {
  vehicles: Vehicle[];
  trips: TripDispatch[];
  expenses: ExpenseClaim[];
  onOpenQuickExpense: () => void;
  onNavigateToTrips: () => void;
}

export const DriverDashboardScreen: React.FC<DriverDashboardScreenProps> = ({
  vehicles,
  trips,
  expenses,
  onOpenQuickExpense,
  onNavigateToTrips,
}) => {
  const { user } = useAuth();
  const [selectedWaybillTrip, setSelectedWaybillTrip] = useState<TripDispatch | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shift & Location Controls
  const [shiftStatus, setShiftStatus] = useState<'on_duty' | 'rest_break' | 'border_queue'>('on_duty');
  const [currentLocation, setCurrentLocation] = useState('Nairobi Inland Depot (ICD)');
  
  // Find driver's assigned vehicle or fallback to first vehicle
  const assignedTruckReg = user?.assignedTruck || 'KDA 542T';
  const assignedVehicle = vehicles.find((v) => v.reg === assignedTruckReg) || vehicles[0];

  // Odometer & Fuel State
  const [odometerKm, setOdometerKm] = useState(assignedVehicle?.odometerKm || 148290);
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [newOdoInput, setNewOdoInput] = useState(String(assignedVehicle?.odometerKm || 148290));

  // SOS Incident & Corridor Delay Reporting
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosType, setSosType] = useState<'border_delay' | 'weighbridge_queue' | 'mechanical_breakdown' | 'pos_fuel_issue'>('border_delay');
  const [sosNotes, setSosNotes] = useState('');

  // Pre-Trip Safety & Corridor Inspection Checklist
  const [checklist, setChecklist] = useState({
    tyres: true,
    fuelTanks: true,
    oilCoolant: true,
    airBrakes: true,
    cargoSeal: true,
    fireExtinguisher: true,
  });
  const [inspectionSignedAt, setInspectionSignedAt] = useState<string | null>('Today 06:15 EAT (Signed & Stamped)');

  // Find driver's active trip
  const activeTrip = trips.find(
    (t) =>
      (t.truckReg === assignedTruckReg || t.driverName.toLowerCase().includes(user?.fullName.toLowerCase() || '')) &&
      t.status !== 'Completed'
  ) || trips[0];

  // Driver's expense vouchers
  const driverExpenses = expenses.filter(
    (e) =>
      e.truckAsset.includes(assignedTruckReg) ||
      (user?.fullName && e.driverName.toLowerCase().includes(user.fullName.toLowerCase()))
  );

  const totalClaimedKes = driverExpenses.reduce((sum, e) => sum + e.amountKes, 0);
  const approvedClaims = driverExpenses.filter((e) => e.status === 'approved').length;
  const pendingClaims = driverExpenses.filter((e) => e.status === 'pending').length;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(label);
    setTimeout(() => setCopiedContact(null), 2500);
  };

  const handleChecklistToggle = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignInspection = () => {
    const allChecked = Object.values(checklist).every(Boolean);
    if (!allChecked) {
      triggerToast('Attention: Please inspect and confirm all 6 safety items before signing.');
      return;
    }
    const timeStr = `Today ${new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })} EAT (Signed & Stamped)`;
    setInspectionSignedAt(timeStr);
    triggerToast('Pre-Trip Inspection Logged & Dispatched to Fleet Ops Controller.');
  };

  const handleSaveOdometer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newOdoInput, 10);
    if (isNaN(parsed) || parsed < odometerKm) {
      triggerToast('Error: New odometer reading cannot be lower than existing reading.');
      return;
    }
    setOdometerKm(parsed);
    setIsOdometerModalOpen(false);
    triggerToast(`Odometer updated to ${parsed.toLocaleString()} km for ${assignedTruckReg}.`);
  };

  const handleSendSosReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSosModalOpen(false);
    setSosNotes('');
    triggerToast(`Emergency Dispatch Incident dispatched to Ansury Corridor Controller. Priority channel active.`);
  };

  return (
    <div className="p-space-lg space-y-space-lg pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 border border-emerald-500/30">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-label-code text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
              shiftStatus === 'on_duty'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : shiftStatus === 'border_queue'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-blue-100 text-blue-900 border-blue-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${shiftStatus === 'on_duty' ? 'bg-emerald-600 animate-pulse' : shiftStatus === 'border_queue' ? 'bg-amber-600' : 'bg-blue-600'}`}></span>
              {shiftStatus === 'on_duty' ? 'Shift Active • Driving' : shiftStatus === 'border_queue' ? 'Border Customs Queue' : 'Rest Break / Standby'}
            </span>
            <span className="text-[11px] text-outline font-label-code">
              Truck: <strong>{assignedTruckReg}</strong>
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight mt-1">
            Welcome, {user?.fullName || 'Driver Joseph Mwangi'}
          </h1>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Your corridor dispatch manifest, route performance baselines, fuel card balance & expense submission.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSosModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-body-sm text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-600">emergency</span>
            Corridor SOS / Report Delay
          </button>

          <button
            onClick={onOpenQuickExpense}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-[12px] font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            Snap & Submit Fuel Receipt (30-Sec)
          </button>
        </div>
      </div>

      {/* Driver Interactive Shift & Checkpoint Bar */}
      <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Shift Status:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => { setShiftStatus('on_duty'); triggerToast('Shift set to On-Duty (Active Voyage)'); }}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all ${shiftStatus === 'on_duty' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Driving (On-Duty)
            </button>
            <button
              onClick={() => { setShiftStatus('border_queue'); triggerToast('Shift set to Border Customs Queue'); }}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all ${shiftStatus === 'border_queue' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Border Queue
            </button>
            <button
              onClick={() => { setShiftStatus('rest_break'); triggerToast('Shift set to Rest Break'); }}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all ${shiftStatus === 'rest_break' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Mandatory Break
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
            <select
              value={currentLocation}
              onChange={(e) => {
                setCurrentLocation(e.target.value);
                triggerToast(`Current location updated to: ${e.target.value}`);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Mombasa Port Gate 2 (Origin)">Mombasa Port Gate 2 (Origin)</option>
              <option value="Mtito Andei Corridor Rest Stop">Mtito Andei Corridor Rest Stop</option>
              <option value="Nairobi Inland Depot (ICD)">Nairobi Inland Depot (ICD)</option>
              <option value="Mai Mahiu Escarpment Shell">Mai Mahiu Escarpment Shell</option>
              <option value="Nakuru Section 58 Weighbridge">Nakuru Section 58 Weighbridge</option>
              <option value="Eldoret Bypass Shell Service">Eldoret Bypass Shell Service</option>
              <option value="Malaba OSBP Border Clearance">Malaba OSBP Border Clearance</option>
              <option value="Jinja Yard (Uganda)">Jinja Yard (Uganda)</option>
              <option value="Kampala Bweyogerere Depot">Kampala Bweyogerere Depot</option>
            </select>
          </div>

          <button
            onClick={() => setIsOdometerModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold transition-colors border border-slate-200"
            title="Update Odometer Reading"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-500">speed</span>
            <span>{odometerKm.toLocaleString()} KM</span>
            <span className="text-[10px] text-primary hover:underline ml-0.5">Edit</span>
          </button>
        </div>
      </div>

      {/* 4 Driver Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Assigned Vehicle */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Assigned Asset
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
            </div>
            <div className="font-label-numeric text-xl font-bold text-on-surface mt-2">
              {assignedVehicle ? assignedVehicle.reg : assignedTruckReg}
            </div>
            <p className="text-[11px] text-outline mt-0.5 font-medium">
              {assignedVehicle ? assignedVehicle.makeModel : 'Mercedes-Benz Actros 2640'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px] font-label-code">
            <span className="text-outline">Tank Capacity:</span>
            <span className="font-bold text-on-surface">{assignedVehicle ? assignedVehicle.fuelCapacityL : 600} Litres</span>
          </div>
        </div>

        {/* Metric 2: Fuel Efficiency Score */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Fleet Fuel Score
              </span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">speed</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-tertiary mt-2">
              {assignedVehicle ? assignedVehicle.actualKmL.toFixed(2) : '2.84'} km/L
            </div>
            <p className="text-[11px] text-outline mt-0.5">
              Target: {assignedVehicle ? assignedVehicle.targetKmL.toFixed(2) : '2.60'} km/L (+9.2% Bonus Eligible)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px] font-label-code text-emerald-700 font-bold">
            <span>Eco-Drive Status:</span>
            <span>OPTIMAL</span>
          </div>
        </div>

        {/* Metric 3: Active Waybill */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Current Waybill
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
            </div>
            <div className="font-label-numeric text-lg font-bold text-primary mt-2">
              {activeTrip ? activeTrip.waybillNumber : 'WB-2026-0941'}
            </div>
            <p className="text-[11px] text-outline mt-0.5 truncate">
              {activeTrip ? activeTrip.route : 'Nairobi → Kampala'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px] font-label-code">
            <span className="text-outline">Status:</span>
            <span className="font-bold text-emerald-800">{activeTrip ? activeTrip.status : 'In Transit'}</span>
          </div>
        </div>

        {/* Metric 4: Vouchers Submitted */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Voyage Vouchers
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">receipt_long</span>
            </div>
            <div className="font-label-numeric text-2xl font-bold text-on-surface mt-2">
              {driverExpenses.length} Vouchers
            </div>
            <p className="text-[11px] text-outline mt-0.5">
              KES {totalClaimedKes.toLocaleString()} Claimed
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px] font-label-code">
            <span className="text-emerald-700 font-bold">{approvedClaims} Approved</span>
            <span className="text-amber-700 font-bold">{pendingClaims} Pending</span>
          </div>
        </div>
      </div>

      {/* Active Trip Details & Navigation Progress */}
      {activeTrip && (
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-code text-[12px] font-bold text-primary">
                  {activeTrip.id}
                </span>
                <span className="font-label-code text-[11px] bg-surface-container-low px-2 py-0.5 rounded text-outline font-semibold">
                  Waybill #{activeTrip.waybillNumber}
                </span>
                <span className="font-label-code text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  {activeTrip.status}
                </span>
              </div>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface mt-1">
                {activeTrip.route}
              </h2>
              <p className="font-body-sm text-[12px] text-outline">
                Corridor: {activeTrip.corridor}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWaybillTrip(activeTrip)}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                View Waybill Docket
              </button>

              <button
                onClick={onNavigateToTrips}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>All Dispatches</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-surface-container-low p-3.5 rounded-xl text-[12px]">
            <div>
              <span className="text-outline text-[10px] uppercase block font-semibold">Shipper / Consignor</span>
              <span className="font-bold text-on-surface block mt-0.5">{activeTrip.shipper}</span>
            </div>
            <div>
              <span className="text-outline text-[10px] uppercase block font-semibold">Cargo Description</span>
              <span className="font-bold text-on-surface block mt-0.5">{activeTrip.cargo}</span>
            </div>
            <div>
              <span className="text-outline text-[10px] uppercase block font-semibold">Origin & Destination</span>
              <span className="text-on-surface block mt-0.5">{activeTrip.origin}</span>
              <span className="text-outline text-[11px]">→ {activeTrip.destination}</span>
            </div>
            <div>
              <span className="text-outline text-[10px] uppercase block font-semibold">ECTS Seal & Tolerance</span>
              <span className="font-label-code text-emerald-800 font-bold block mt-0.5">Electronic Seal Secured</span>
              <span className="text-outline text-[11px]">0.0% Weighbridge Tolerance</span>
            </div>
          </div>

          {/* Route Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-label-code text-outline mb-1.5">
              <span>Transit Progress ({activeTrip.origin.split(' ')[0]} to {activeTrip.destination.split(' ')[0]})</span>
              <span className="font-bold text-on-surface">{activeTrip.progressPct}% • Target ETA: {activeTrip.eta}</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${activeTrip.progressPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Trip Safety & Corridor Inspection Checklist */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Pre-Trip Vehicle Safety & ECTS Cargo Inspection
              </h3>
            </div>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              Northern Corridor KeNHA & KRA transit compliance check before departure or shift handover.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
              {inspectionSignedAt || 'Pending Driver Sign-Off'}
            </span>
            <button
              onClick={handleSignInspection}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-[12px] font-semibold hover:bg-primary-container shadow-xs flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">draw</span>
              <span>Sign & Submit Inspection</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              key: 'tyres' as const,
              label: 'Tyres & Wheel Nut Torque',
              desc: 'Dual drive tyres, spare tyre pressure & lug nuts secure',
              icon: 'tire_repair',
            },
            {
              key: 'fuelTanks' as const,
              label: 'Dual 600L Fuel Tanks & Seals',
              desc: 'Aluminum tanks, drain plugs tight, anti-siphon mesh intact',
              icon: 'local_gas_station',
            },
            {
              key: 'oilCoolant' as const,
              label: 'Engine Oil & Radiator Coolant',
              desc: 'Dipstick check at normal range, zero hose seepage',
              icon: 'oil_barrel',
            },
            {
              key: 'airBrakes' as const,
              label: 'Air Brake Dual Pressure > 8.0 Bar',
              desc: 'Pneumatic air tanks charged, zero audible leak on brake test',
              icon: 'compress',
            },
            {
              key: 'cargoSeal' as const,
              label: 'ECTS Electronic Cargo Seal',
              desc: 'KRA electronic transit seal armed, antenna flashing green',
              icon: 'security',
            },
            {
              key: 'fireExtinguisher' as const,
              label: 'Safety Gear & 9kg Extinguisher',
              desc: 'Reflective triangles, high-vis jacket, dry powder valid',
              icon: 'fire_extinguisher',
            },
          ].map((item) => {
            const isChecked = checklist[item.key];
            return (
              <div
                key={item.key}
                onClick={() => handleChecklistToggle(item.key)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-400 bg-white'
                  }`}
                >
                  {isChecked && <span className="material-symbols-outlined text-[15px]">check</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[12px] flex items-center gap-1.5">
                    <span>{item.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Driver Vouchers & Emergency Checkpoint Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: My Submitted Vouchers */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                My Voyage Expense Vouchers
              </h3>
              <p className="font-body-sm text-[12px] text-outline">
                Receipts and fuel claims submitted from this truck ({assignedTruckReg})
              </p>
            </div>
            <button
              onClick={onOpenQuickExpense}
              className="text-primary font-bold text-[12px] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              + New Voucher
            </button>
          </div>

          {driverExpenses.length > 0 ? (
            <div className="divide-y divide-[#eff4ff] overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-outline text-[10px] uppercase font-label-sm border-b border-[#e5eeff]">
                    <th className="py-2">Voucher</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Vendor</th>
                    <th className="py-2 text-right">Amount (KES)</th>
                    <th className="py-2 text-center">Receipt</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {driverExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 font-label-code font-bold text-primary">
                        {exp.claimNumber}
                      </td>
                      <td className="py-2.5 text-on-surface font-medium">{exp.category}</td>
                      <td className="py-2.5 text-outline text-[11px] truncate max-w-[140px]">{exp.vendor}</td>
                      <td className="py-2.5 text-right font-label-numeric font-bold text-on-surface">
                        KES {exp.amountKes.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center">
                        {exp.receiptAttached ? (
                          <span className="material-symbols-outlined text-emerald-600 text-[16px]">receipt</span>
                        ) : (
                          <span className="text-amber-600 font-label-code text-[10px] font-bold">Missing</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            exp.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : exp.status === 'held'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-outline text-[12px]">
              <span className="material-symbols-outlined text-[36px] text-outline/40 mb-1 block">receipt_long</span>
              No vouchers submitted yet on this voyage. Tap &quot;Snap &amp; Submit Fuel Receipt&quot; to log your fuel or toll receipts.
            </div>
          )}
        </div>

        {/* Right 1 Col: Corridor Safety & Emergency Checkpoints */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
          <div className="border-b border-[#e5eeff] pb-2">
            <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-rose-600 text-[20px]">support_agent</span>
              Corridor Checkpoint Hotlines
            </h3>
            <p className="font-body-sm text-[11px] text-outline">
              Direct contacts for dispatch, weighbridges, and border clearance
            </p>
          </div>

          <div className="space-y-2 text-[12px]">
            {[
              {
                title: 'Northern Corridor Malaba OSBP Desk',
                phone: '+254 722 890 114',
                desc: 'Uganda border customs queue & seal verification',
                icon: 'gavel',
              },
              {
                title: 'Eldoret Bypass 24/7 Breakdown Dispatch',
                phone: '+254 733 410 882',
                desc: 'Mobile tyre service, towing & engine diagnostics',
                icon: 'car_repair',
              },
              {
                title: 'Ansury Fleet Operations Controller',
                phone: '+254 711 002 918',
                desc: 'Senior Dispatcher Otieno O. (Route clearance)',
                icon: 'headset_mic',
              },
              {
                title: 'Safaricom M-Pesa Driver Float Desk',
                phone: 'Paybill: 809214',
                desc: 'Fuel card top-up authorization',
                icon: 'payments',
              },
            ].map((contact) => (
              <div
                key={contact.title}
                className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-on-surface block text-[12px]">
                    {contact.title}
                  </span>
                  <p className="text-[10px] text-outline mt-0.5">{contact.desc}</p>
                  <span className="font-mono text-primary font-bold text-[12px] block mt-1">
                    {contact.phone}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(contact.phone, contact.title)}
                  className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors shrink-0"
                  title="Copy Phone Number"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedContact === contact.title ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#eff4ff] text-[10px] text-outline font-label-code">
            Speed Limit: 80 km/h • KeNHA Gross Weight Limit: 50,000 kg (6-Axle)
          </div>
        </div>
      </div>

      {/* WAYBILL DOCKET MODAL */}
      {selectedWaybillTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedWaybillTrip(null)}></div>
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">assignment</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Transit Waybill Docket #{selectedWaybillTrip.waybillNumber}
                  </h3>
                  <p className="font-label-sm text-[11px] text-outline">
                    Vehicle: {selectedWaybillTrip.truckReg} • Driver: {selectedWaybillTrip.driverName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWaybillTrip(null)}
                className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-lg space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-4 bg-[#fffdf7] border border-[#e2d7c0] rounded-xl font-mono text-[11px] text-slate-800 space-y-3">
                <div className="flex justify-between items-start pb-2 border-b border-dashed border-[#c7b99c]">
                  <div>
                    <div className="font-bold text-[14px]">ANSURY LOGISTICS LIMITED</div>
                    <div>EAST AFRICAN FREIGHT EXPEDITION</div>
                    <div>PIN: P051398214M</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{selectedWaybillTrip.waybillNumber}</div>
                    <div>DATE: {selectedWaybillTrip.startDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-2 border-b border-dashed border-[#c7b99c]">
                  <div>
                    <div className="text-slate-500 uppercase font-bold text-[9px]">SHIPPER:</div>
                    <div className="font-bold text-[12px]">{selectedWaybillTrip.shipper}</div>
                    <div>FROM: {selectedWaybillTrip.origin}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase font-bold text-[9px]">DESTINATION:</div>
                    <div className="font-bold text-[12px]">{selectedWaybillTrip.destination}</div>
                    <div>VIA: {selectedWaybillTrip.corridor}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-dashed border-[#c7b99c]">
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">CARGO:</span>
                    <span className="font-bold">{selectedWaybillTrip.cargo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">PRIME MOVER:</span>
                    <span className="font-bold">{selectedWaybillTrip.truckReg} ({selectedWaybillTrip.truckModel})</span>
                  </div>
                </div>

                <div className="pt-1 text-[10px] text-slate-600">
                  <div><strong>Special Transit Notes:</strong> {selectedWaybillTrip.notes}</div>
                </div>
              </div>
            </div>

            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-t border-[#e5eeff]">
              <span className="text-[11px] text-outline font-label-code">
                Carrier Transit Copy • Driver Docket
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-[12px] shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Transit Waybill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ODOMETER UPDATE MODAL */}
      {isOdometerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">speed</span>
                <h3 className="text-base font-bold text-slate-900">Update Truck Odometer</h3>
              </div>
              <button onClick={() => setIsOdometerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveOdometer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Assigned Prime Mover
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900">
                  {assignedTruckReg} • {assignedVehicle?.makeModel || 'Actros 2640'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Current Kilometre Reading (KM) *
                </label>
                <input
                  type="number"
                  required
                  min={odometerKm}
                  value={newOdoInput}
                  onChange={(e) => setNewOdoInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm font-bold text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Previous log: {odometerKm.toLocaleString()} km
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOdometerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-xs"
                >
                  Save Odometer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORRIDOR EMERGENCY SOS / DELAY REPORT MODAL */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[24px]">emergency</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Corridor Incident & Delay SOS</h3>
                  <p className="text-[11px] text-slate-500">Instant dispatch priority alert to Operations Controller</p>
                </div>
              </div>
              <button onClick={() => setIsSosModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendSosReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Incident Category *
                </label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                >
                  <option value="border_delay">Malaba / Busia Border Customs Queue (&gt; 4 hrs)</option>
                  <option value="weighbridge_queue">KeNHA Weighbridge Congestion / Calibration Hold</option>
                  <option value="mechanical_breakdown">Mechanical Breakdown / Tyre Puncture / Towing</option>
                  <option value="pos_fuel_issue">Fuel Card POS Terminal Declined / Float Required</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Exact Location / Milestone *
                </label>
                <input
                  type="text"
                  required
                  defaultValue={currentLocation}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Incident Details & Driver Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={sosNotes}
                  onChange={(e) => setSosNotes(e.target.value)}
                  placeholder="Describe situation: e.g. Left rear drive tyre puncture at KM 312 near Turbo, or Uganda customs server down at Malaba OSBP..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[11px] flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">phone_in_talk</span>
                <div>
                  <strong>Urgent Breakdown Dispatch:</strong> Also call Senior Controller Otieno directly at <span className="font-mono font-bold">+254 711 002 918</span>.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Broadcast SOS to Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
