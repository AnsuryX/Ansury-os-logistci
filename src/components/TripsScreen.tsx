import React, { useState } from 'react';

export const TripsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'transit' | 'cleared'>('all');

  const trips = [
    {
      id: 'TRP-0241',
      route: 'Nairobi → Kampala',
      corridor: 'Northern Corridor (Malaba OSBP)',
      shipper: 'Vivo Energy Uganda',
      cargo: '36,000 L Low Sulphur Diesel',
      truck: 'KDA 542T • Mercedes Actros',
      driver: 'Joseph Mwangi',
      status: 'In Transit (Tororo Cross)',
      statusColor: 'bg-emerald-100 text-emerald-900',
      progressPct: 78,
      eta: 'Today 18:30 EAT',
      grossValue: 'KES 410,000',
    },
    {
      id: 'TRP-0238',
      route: 'Mombasa Port → Jinja',
      corridor: 'Northern Corridor (Busia OSBP)',
      shipper: 'Mukwano Industries',
      cargo: '28 MT Palm Oil Fatty Distillate',
      truck: 'KDB 819M • Scania R480',
      driver: 'Jackson Kiprop',
      status: 'Customs Hold (Malaba)',
      statusColor: 'bg-amber-100 text-amber-900',
      progressPct: 52,
      eta: 'Tomorrow 10:00 EAT',
      grossValue: 'KES 380,000',
    },
    {
      id: 'TRP-0245',
      route: 'Nairobi → Kisumu',
      corridor: 'Western Kenya Highway',
      shipper: 'TotalEnergies Marketing Kenya',
      cargo: '32,000 L Super Petrol',
      truck: 'KCJ 312L • Isuzu Giga Heavy',
      driver: 'Samuel Omwenga',
      status: 'Discharging at Kisumu Depot',
      statusColor: 'bg-blue-100 text-blue-900',
      progressPct: 94,
      eta: 'Completed Today',
      grossValue: 'KES 210,000',
    },
    {
      id: 'TRP-0249',
      route: 'Mombasa Port → Nairobi ICD',
      corridor: 'A109 Highway',
      shipper: 'Maersk Logistics Kenya',
      cargo: '2x 20ft High Cube Containers',
      truck: 'KDF 109P • Volvo FH16',
      driver: 'Musa Kimeto',
      status: 'Rolling (Mtito Andei)',
      statusColor: 'bg-emerald-100 text-emerald-900',
      progressPct: 45,
      eta: 'Tomorrow 04:00 EAT',
      grossValue: 'KES 195,000',
    },
  ];

  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              Operations & Logistics / Corridor Dispatch
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight mt-1">
            Trips & Dispatches
          </h1>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Real-time transit manifests across Northern Corridor checkpoints, weighbridges & border OSBPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-body-sm text-[12px] font-medium shadow-sm transition-all flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create New Dispatch Manifest
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div>
                <span className="font-label-code text-[12px] font-bold text-primary">
                  {trip.id}
                </span>
                <div className="font-headline-sm text-[15px] font-bold text-on-surface mt-0.5">
                  {trip.route}
                </div>
              </div>
              <span className={`font-label-code text-[10px] px-2 py-0.5 rounded-full font-bold ${trip.statusColor}`}>
                {trip.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-2.5 rounded-xl">
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Shipper</span>
                <span className="font-semibold text-on-surface">{trip.shipper}</span>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Cargo</span>
                <span className="text-on-surface">{trip.cargo}</span>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Truck & Driver</span>
                <span className="font-label-code text-on-surface block">{trip.truck}</span>
                <span className="text-outline text-[11px]">{trip.driver}</span>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase block font-semibold">Gross Contract Value</span>
                <span className="font-label-numeric font-bold text-on-surface">{trip.grossValue}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-outline mb-1 font-label-code">
                <span>Corridor Progress</span>
                <span>{trip.progressPct}% (ETA: {trip.eta})</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${trip.progressPct}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
