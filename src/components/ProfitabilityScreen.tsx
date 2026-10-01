import React, { useState } from 'react';
import { MOCK_TRIP_DEEP_DIVE } from '../data/mockData';
import { downloadCsv } from '../utils/format';

export const ProfitabilityScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'trips' | 'vehicles' | 'routes'>('trips');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPnLLedger = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const headers = [
      'Registration',
      'Make / Model',
      'Assigned Driver',
      'Completed Trips',
      'Distance (km)',
      'Gross Revenue (KES)',
      'Fuel Expense (KES)',
      'Tolls & Border Cess (KES)',
      'Maintenance & Repairs (KES)',
      'Gross Profit (KES)',
      'Margin %',
      'Cost per km (KES)',
      'Performance Status',
    ];

    const rows = vehicleLedger.map((v) => [
      v.reg,
      v.model,
      v.driver,
      v.trips,
      v.distanceKm,
      v.revenueKes,
      v.fuelKes,
      v.tollsKes,
      v.maintKes,
      v.grossProfitKes,
      `${v.marginPct}%`,
      v.costPerKm,
      v.status,
    ]);

    downloadCsv(`Ansury_Corridor_Vehicle_Profitability_Ledger_${dateStr}.csv`, [headers, ...rows]);
    triggerToast(`Exported ${vehicleLedger.length} vehicle profitability records to CSV!`);
  };

  const trip = MOCK_TRIP_DEEP_DIVE;
  const netTripProfit = trip.grossRevenueKes - trip.fuelExpenseKes - trip.borderTollsKes - trip.driverAllowanceKes - trip.weighbridgeCessKes - trip.accommodationKes - trip.repairKes;
  const grossMarginPct = ((netTripProfit / trip.grossRevenueKes) * 100).toFixed(1);
  const profitPerKm = (netTripProfit / trip.distanceKm).toFixed(2);
  const fuelSharePct = ((trip.fuelExpenseKes / trip.grossRevenueKes) * 100).toFixed(1);

  const vehicleLedger = [
    {
      reg: 'KDA 542T',
      model: 'Actros 2640',
      driver: 'John Kuria',
      trips: 4,
      distanceKm: 5200,
      revenueKes: 1640000,
      fuelKes: 524000,
      tollsKes: 98000,
      maintKes: 64000,
      grossProfitKes: 954000,
      marginPct: 58.2,
      costPerKm: 131.9,
      status: 'Optimal',
    },
    {
      reg: 'KDB 819M',
      model: 'Scania R480',
      driver: 'Ali Mwangi',
      trips: 3,
      distanceKm: 4100,
      revenueKes: 1220000,
      fuelKes: 442000,
      tollsKes: 82000,
      maintKes: 48000,
      grossProfitKes: 648000,
      marginPct: 53.1,
      costPerKm: 139.5,
      status: 'Optimal',
    },
    {
      reg: 'KCB 190X',
      model: 'Isuzu Giga',
      driver: 'Samuel Otieno',
      trips: 8,
      distanceKm: 2840,
      revenueKes: 780000,
      fuelKes: 268000,
      tollsKes: 24000,
      maintKes: 82000,
      grossProfitKes: 406000,
      marginPct: 52.1,
      costPerKm: 131.7,
      status: 'Normal',
    },
    {
      reg: 'KDD 314A',
      model: 'Volvo FH16',
      driver: 'Peter Ndungu',
      trips: 2,
      distanceKm: 2600,
      revenueKes: 820000,
      fuelKes: 286000,
      tollsKes: 52000,
      maintKes: 31000,
      grossProfitKes: 451000,
      marginPct: 55.0,
      costPerKm: 141.9,
      status: 'Optimal',
    },
    {
      reg: 'KDC 672P',
      model: 'Actros 3340',
      driver: 'Francis Mutua',
      trips: 1,
      distanceKm: 820,
      revenueKes: 360000,
      fuelKes: 122000,
      tollsKes: 18000,
      maintKes: 125000,
      grossProfitKes: 95000,
      marginPct: 26.4,
      costPerKm: 323.2,
      status: 'Sub-Par',
    },
  ];

  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              Corporate Treasury • Unit Economics Engine
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Trip & Vehicle Profitability
            </h1>
            <span className="font-label-code text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
              Corridor Economics
            </span>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Granular P&L attribution per haulage voyage, fuel efficiency indexing, gross contribution & asset yield.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportPnLLedger}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest border border-[#dce9ff] hover:bg-surface-container text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            title="Download Vehicle & Corridor P&L Ledger CSV"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Export P&L Ledger (.csv)
          </button>
        </div>
      </div>

      {/* 6 Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Total Revenue
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            </div>
            <div className="font-label-numeric text-[19px] font-bold text-on-surface mt-2">
              KES 4,820,000
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Target: 4.50M</span>
            <span className="font-label-code text-tertiary font-bold">+8.4%</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Transport OPEX
              </span>
              <span className="material-symbols-outlined text-amber-600 text-[18px]">receipt_long</span>
            </div>
            <div className="font-label-numeric text-[19px] font-bold text-on-surface mt-2">
              KES 2,410,000
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Fuel: 1.64M</span>
            <span className="font-label-code text-on-surface-variant font-medium">Tolls: 350K</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Gross Contribution
              </span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">trending_up</span>
            </div>
            <div className="font-label-numeric text-[19px] font-bold text-tertiary mt-2">
              KES 2,410,000
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Margin: 50.0%</span>
            <span className="font-label-code text-tertiary font-bold">+1.8 pts</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Rev / KM
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
            </div>
            <div className="font-label-numeric text-[19px] font-bold text-on-surface mt-2">
              KES 148.50
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Base: 135.00</span>
            <span className="font-label-code text-tertiary font-bold">+10.0%</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Cost / KM
              </span>
              <span className="material-symbols-outlined text-outline text-[18px]">toll</span>
            </div>
            <div className="font-label-numeric text-[19px] font-bold text-on-surface mt-2">
              KES 74.20
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Base: 78.00</span>
            <span className="font-label-code text-tertiary font-bold">-4.8%</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Net Profit / KM
              </span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
            </div>
            <div className="font-label-numeric text-[19px] font-bold text-tertiary mt-2">
              KES 74.30
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
            <span className="text-outline">Spread: +30.3%</span>
            <span className="font-label-code text-tertiary font-bold">Optimal</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('trips')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all ${
              activeSubTab === 'trips'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Trip Profitability (Unit Economics)
          </button>
          <button
            onClick={() => setActiveSubTab('vehicles')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all ${
              activeSubTab === 'vehicles'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Vehicle Economics & Fleet P&L
          </button>
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`px-3 py-1.5 rounded-xl font-body-sm text-[12px] font-semibold transition-all ${
              activeSubTab === 'routes'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Route Margin Benchmarks
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 font-label-code text-[11px] text-outline px-2">
          <span>Live FX: 1 USD = 129.35 KES</span>
          <span>•</span>
          <span>1 UGX = 0.035 KES</span>
        </div>
      </div>

      {/* Deep Dive Trip Economics Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-4">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-code text-[13px] font-bold text-primary">
                {trip.tripId}
              </span>
              <span className="font-headline-sm text-[15px] font-bold text-on-surface">
                {trip.origin} → {trip.destination}
              </span>
              <span className="font-label-code text-[10px] bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded font-bold">
                COMPLETED
              </span>
            </div>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              Shipper: <strong>{trip.customer}</strong> • Cargo: {trip.cargo} • Waybill: {trip.waybill}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[12px]">
            <div className="text-right">
              <span className="font-label-code font-bold text-on-surface block">
                {trip.truckReg} ({trip.truckModel})
              </span>
              <span className="text-outline">Driver: {trip.driver} • {trip.distanceKm} KM</span>
            </div>
          </div>
        </div>

        {/* 3-Column Breakout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg pt-1">
          {/* Column 01: Customer Revenue */}
          <div className="bg-surface-container-low p-4 rounded-2xl border border-[#dce9ff] flex flex-col justify-between">
            <div>
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold block">
                01. Customer Revenue
              </span>
              <div className="font-label-numeric text-2xl font-bold text-on-surface mt-1">
                KES {trip.grossRevenueKes.toLocaleString()}
              </div>

              <div className="mt-4 space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Billing Yield:</span>
                  <span className="font-label-numeric font-bold text-on-surface">
                    KES {(trip.grossRevenueKes / trip.distanceKm).toFixed(2)} / km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Invoice Reference:</span>
                  <span className="font-label-code font-bold text-primary">INV-2025-0518</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Credit Terms:</span>
                  <span className="text-on-surface">Net 14 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Discharge Cert:</span>
                  <span className="text-tertiary font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">done</span>
                    Zero Loss Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#dce9ff] text-[11px] text-outline">
              Payment due via KCB Direct EFT on 12 June 2025.
            </div>
          </div>

          {/* Column 02: Direct Operating Expenses */}
          <div className="bg-surface-container-low p-4 rounded-2xl border border-[#dce9ff] flex flex-col justify-between">
            <div>
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold block">
                02. Direct Operating Expenses
              </span>
              <div className="font-label-numeric text-2xl font-bold text-on-surface mt-1">
                KES {(trip.grossRevenueKes - netTripProfit).toLocaleString()}
              </div>

              <div className="mt-4 space-y-1.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Diesel Fuel (620 L):</span>
                  <span className="font-label-numeric font-bold text-on-surface">
                    KES {trip.fuelExpenseKes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Border Tolls & Malaba OSBP:</span>
                  <span className="font-label-numeric text-on-surface">
                    KES {trip.borderTollsKes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Driver Haul Allowance:</span>
                  <span className="font-label-numeric text-on-surface">
                    KES {trip.driverAllowanceKes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Weighbridge & County Cess:</span>
                  <span className="font-label-numeric text-on-surface">
                    KES {trip.weighbridgeCessKes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Driver Lodging & Meals:</span>
                  <span className="font-label-numeric text-on-surface">
                    KES {trip.accommodationKes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">En-Route Repair (Brake hose):</span>
                  <span className="font-label-numeric text-on-surface">
                    KES {trip.repairKes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#dce9ff] text-[11px] text-outline">
              Average fuel consumption: 47.7 L/100km across Rift Valley escarpment.
            </div>
          </div>

          {/* Column 03: Unit Economics */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="font-label-sm text-[11px] text-emerald-800 uppercase font-semibold block">
                03. Net Unit Economics
              </span>
              <div className="font-label-numeric text-2xl font-bold text-tertiary mt-1">
                KES {netTripProfit.toLocaleString()}
              </div>

              <div className="mt-4 space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-emerald-900 font-medium">Gross Trip Margin:</span>
                  <span className="font-label-numeric font-bold text-tertiary">
                    {grossMarginPct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-900 font-medium">Profit per KM:</span>
                  <span className="font-label-numeric font-bold text-tertiary">
                    KES {profitPerKm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-900 font-medium">Fuel Share of Revenue:</span>
                  <span className="font-label-numeric font-bold text-on-surface">
                    {fuelSharePct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-900 font-medium">Target Margin Spread:</span>
                  <span className="font-label-numeric text-tertiary font-bold">
                    +12.3 pts vs Model
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => triggerToast('Voyage Accounting Dossier #TRP-0241 generated and linked to audit ledger.')}
              className="mt-4 w-full py-2 bg-primary text-on-primary rounded-xl font-body-sm text-[12px] font-medium hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Generate Voyage Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Visual Bars & Donut Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* Route Margin Benchmarks */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
            <span className="font-headline-sm text-[13px] font-bold text-on-surface">
              CORRIDOR UNIT MARGIN BENCHMARKS
            </span>
            <span className="font-label-code text-[11px] text-primary font-bold">
              Target: &gt;45%
            </span>
          </div>

          <div className="space-y-3 text-[12px]">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-on-surface">Nairobi → Kampala (Northern Corridor)</span>
                <span className="font-label-code font-bold text-tertiary">57.3% Margin</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '57.3%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-outline mt-0.5">
                <span>Revenue: KES 410,000</span>
                <span>OPEX: KES 175,200</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-on-surface">Mombasa Port → Nairobi (Container Haul)</span>
                <span className="font-label-code font-bold text-tertiary">52.1% Margin</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '52.1%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-outline mt-0.5">
                <span>Revenue: KES 320,000</span>
                <span>OPEX: KES 153,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-on-surface">Nairobi → Kisumu (Western Distribution)</span>
                <span className="font-label-code font-bold text-tertiary">49.0% Margin</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '49.0%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-outline mt-0.5">
                <span>Revenue: KES 210,000</span>
                <span>OPEX: KES 107,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-on-surface">Eldoret → Tororo (Short Shunt)</span>
                <span className="font-label-code font-bold text-amber-600">32.0% Margin</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '32.0%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-outline mt-0.5">
                <span>Revenue: KES 140,000</span>
                <span>OPEX: KES 95,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donut Gauge: Fuel % of Gross Revenue */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
            <span className="font-headline-sm text-[13px] font-bold text-on-surface">
              FUEL SHARE OF REVENUE (FLEET AVERAGE)
            </span>
            <span className="font-label-code text-[11px] text-tertiary font-bold bg-emerald-50 px-2 py-0.5 rounded">
              OPTIMAL ZONE (&lt;40%)
            </span>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#e5eeff" strokeWidth="12" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3525cd"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset="158.2" // 36.8%
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-label-numeric text-2xl font-bold text-on-surface">
                  36.8%
                </span>
                <span className="font-label-code text-[10px] text-outline uppercase font-semibold">
                  Fuel Ratio
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#eff4ff] text-center text-[11px]">
            <div>
              <span className="text-outline block">Total Litres</span>
              <span className="font-label-numeric font-bold text-on-surface">8,290 L</span>
            </div>
            <div>
              <span className="text-outline block">Avg Pump Price</span>
              <span className="font-label-numeric font-bold text-on-surface">KES 180 / L</span>
            </div>
            <div>
              <span className="text-outline block">Burn Pace</span>
              <span className="font-label-numeric font-bold text-on-surface">42.2 L/100km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Vehicle Economics & Fleet P&L Ledger */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-space-lg flex items-center justify-between border-b border-[#e5eeff]">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              VEHICLE ECONOMICS & FLEET P&L LEDGER (MTD)
            </h3>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              Individual prime mover gross contribution, direct variable costs & net margins.
            </p>
          </div>
          <span className="font-label-code text-[11px] text-outline">
            5 Prime Movers Reported
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-[10px] text-outline uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-2.5 px-4">Vehicle Reg / Model</th>
                <th className="py-2.5 px-4">Driver</th>
                <th className="py-2.5 px-4">Trips</th>
                <th className="py-2.5 px-4">Total KM</th>
                <th className="py-2.5 px-4">Gross Revenue</th>
                <th className="py-2.5 px-4">Fuel Expense</th>
                <th className="py-2.5 px-4">Tolls / Cess</th>
                <th className="py-2.5 px-4">Maintenance</th>
                <th className="py-2.5 px-4">Gross Profit</th>
                <th className="py-2.5 px-4">Margin %</th>
                <th className="py-2.5 px-4">Cost / KM</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {vehicleLedger.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-label-code">
                    <div className="font-bold text-on-surface">{row.reg}</div>
                    <div className="text-[10px] text-outline">{row.model}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-on-surface">{row.driver}</td>
                  <td className="py-3 px-4 font-label-numeric text-on-surface">{row.trips}</td>
                  <td className="py-3 px-4 font-label-numeric font-semibold text-on-surface">
                    {row.distanceKm.toLocaleString()} KM
                  </td>
                  <td className="py-3 px-4 font-label-numeric font-bold text-on-surface">
                    KES {row.revenueKes.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-label-numeric text-on-surface">
                    KES {row.fuelKes.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-label-numeric text-on-surface">
                    KES {row.tollsKes.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-label-numeric text-on-surface">
                    KES {row.maintKes.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-label-numeric font-bold text-tertiary">
                    KES {row.grossProfitKes.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-label-numeric">
                    <span className={`font-bold ${row.marginPct > 50 ? 'text-tertiary' : 'text-amber-600'}`}>
                      {row.marginPct}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-label-numeric text-on-surface">
                    KES {row.costPerKm.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${
                        row.status === 'Optimal'
                          ? 'bg-emerald-100 text-emerald-900'
                          : row.status === 'Normal'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Summary Grand Total */}
            <tfoot>
              <tr className="bg-surface-container-low font-bold text-[12px] border-t-2 border-[#dce9ff]">
                <td className="py-3 px-4">TOTALS (5 ASSETS)</td>
                <td className="py-3 px-4">—</td>
                <td className="py-3 px-4 font-label-numeric">18 Trips</td>
                <td className="py-3 px-4 font-label-numeric">15,560 KM</td>
                <td className="py-3 px-4 font-label-numeric text-on-surface">KES 4,820,000</td>
                <td className="py-3 px-4 font-label-numeric">KES 1,642,000</td>
                <td className="py-3 px-4 font-label-numeric">KES 274,000</td>
                <td className="py-3 px-4 font-label-numeric">KES 350,000</td>
                <td className="py-3 px-4 font-label-numeric text-tertiary">KES 2,554,000</td>
                <td className="py-3 px-4 font-label-numeric text-tertiary">53.0%</td>
                <td className="py-3 px-4 font-label-numeric">KES 145.6</td>
                <td className="py-3 px-4 text-right font-label-code text-tertiary">VERIFIED</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
