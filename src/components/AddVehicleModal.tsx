import React, { useState } from 'react';
import { Vehicle } from '../types';
import { safeInitials, uniqueId } from '../utils/format';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (vehicle: Vehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
}) => {
  const [reg, setReg] = useState('');
  const [makeModel, setMakeModel] = useState('Scania R500 V8 Streamline');
  const [driver, setDriver] = useState('');
  const [corridor, setCorridor] = useState('Mombasa - Malaba - Kampala (HFO Corridor)');
  const [targetKmL, setTargetKmL] = useState('2.40');
  const [status, setStatus] = useState<Vehicle['status']>('Active');
  const [tankCapacityL, setTankCapacityL] = useState('38000');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.trim()) {
      setErrorMsg('Please enter vehicle registration plate (e.g. KDF 819M)');
      return;
    }
    if (!driver.trim()) {
      setErrorMsg('Please assign a primary operator / driver');
      return;
    }

    const driverName = driver.trim();
    const initials = safeInitials(driverName);

    const newVehicle: Vehicle = {
      id: uniqueId('veh'),
      reg: reg.trim().toUpperCase(),
      makeModel,
      driver: driverName,
      driverId: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      driverInitials: initials,
      corridor,
      tripCode: `TRP-0${Math.floor(200 + Math.random() * 800)}`,
      tripLocation: 'Mombasa Port Gate 14 (Dispatched)',
      distanceKm: 0,
      fuelConsumedL: 0,
      actualKmL: parseFloat(targetKmL) || 2.4,
      targetKmL: parseFloat(targetKmL) || 2.4,
      efficiencyPct: 100,
      fuelCostKes: 0,
      status,
      avatarBg: 'bg-primary',
    };

    onAddVehicle(newVehicle);
    // Reset form
    setReg('');
    setDriver('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg border border-[#dce9ff] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5eeff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Add Fleet Asset & Prime Mover
              </h2>
              <p className="font-body-sm text-[11px] text-outline">
                Register prime mover, tanker trailer, and assign corridor telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[13px]">
          {errorMsg && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl font-body-sm text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Plate Registration *
              </label>
              <input
                type="text"
                placeholder="e.g. KDF 819M"
                value={reg}
                onChange={(e) => {
                  setReg(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-[13px] font-bold text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Make & Model *
              </label>
              <select
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              >
                <option value="Scania R500 V8 Streamline">Scania R500 V8 Streamline</option>
                <option value="Mercedes-Benz Actros 3340">Mercedes-Benz Actros 3340</option>
                <option value="Volvo FH16 540 Globetrotter">Volvo FH16 540 Globetrotter</option>
                <option value="MAN TGX 26.480 6x4">MAN TGX 26.480 6x4</option>
                <option value="FAW J6P 420 Heavy Tanker">FAW J6P 420 Heavy Tanker</option>
                <option value="Shacman X3000 Prime Mover">Shacman X3000 Prime Mover</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Assigned Driver *
              </label>
              <input
                type="text"
                placeholder="e.g. Juma Omwamba"
                value={driver}
                onChange={(e) => {
                  setDriver(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Operating Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Vehicle['status'])}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              >
                <option value="Active">Active (In Transit)</option>
                <option value="Maintenance">Maintenance / Workshop</option>
                <option value="Completed">Ready for Dispatch</option>
                <option value="Anomaly">Flagged Anomaly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
              Primary Corridor Route
            </label>
            <select
              value={corridor}
              onChange={(e) => setCorridor(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
            >
              <option value="Mombasa - Malaba - Kampala (HFO Corridor)">
                Mombasa - Malaba - Kampala (HFO Corridor)
              </option>
              <option value="Mombasa - Jinja - Kampala Transit">
                Mombasa - Jinja - Kampala Transit
              </option>
              <option value="Nairobi - Katuna - Kigali (Rwanda Corridor)">
                Nairobi - Katuna - Kigali (Rwanda Corridor)
              </option>
              <option value="Eldoret - Malaba - Goma DRC">
                Eldoret - Malaba - Goma DRC
              </option>
              <option value="Mombasa - Busia - Juba (South Sudan Route)">
                Mombasa - Busia - Juba (South Sudan Route)
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Target Fuel Efficiency (km/L)
              </label>
              <input
                type="number"
                step="0.05"
                value={targetKmL}
                onChange={(e) => setTargetKmL(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Trailer Tank Capacity (Litres)
              </label>
              <input
                type="number"
                step="1000"
                value={tankCapacityL}
                onChange={(e) => setTankCapacityL(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#e5eeff] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-body-sm text-[12px] font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Save & Register Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
