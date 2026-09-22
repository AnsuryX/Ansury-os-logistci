import React from 'react';
import { Vehicle } from '../types';

interface FleetScreenProps {
  vehicles: Vehicle[];
}

export const FleetScreen: React.FC<FleetScreenProps> = ({ vehicles }) => {
  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              Fleet Engineering & Telematics
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight mt-1">
            Vehicles & Prime Movers
          </h1>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            52 Commercial Assets • OBD-II / CANBUS J1939 Telematics • Odometer & Tank NFC Sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Fleet Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div>
                <span className="font-label-code text-[14px] font-bold text-on-surface">
                  {v.reg}
                </span>
                <div className="font-body-sm text-[11px] text-outline">{v.makeModel}</div>
              </div>
              <span
                className={`font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold ${
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
                <span className="text-on-surface-variant">Assigned Operator:</span>
                <span className="font-semibold text-on-surface">{v.driver} ({v.driverId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Active Corridor:</span>
                <span className="text-on-surface">{v.corridor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Fuel Efficiency:</span>
                <span className={`font-label-numeric font-bold ${v.efficiencyPct < 0 ? 'text-error' : 'text-tertiary'}`}>
                  {v.actualKmL > 0 ? `${v.actualKmL} km/L` : 'In Yard'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">MTD Fuel Spend:</span>
                <span className="font-label-numeric font-bold text-on-surface">
                  KES {v.fuelCostKes.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
              <span className="text-tertiary flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                CANBUS Online
              </span>
              <button className="text-primary font-semibold hover:underline font-label-code">
                Diagnostic Log →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
