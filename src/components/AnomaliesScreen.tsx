import React, { useState } from 'react';
import { AnomalyIncident } from '../types';

interface AnomaliesScreenProps {
  anomalies?: AnomalyIncident[];
  onResolveAnomaly: (id: string, title?: string) => void;
}

const DEFAULT_ANOMALIES: AnomalyIncident[] = [
  {
    id: 'anom-1',
    title: 'KDA 542T • Telemetry Fuel Spike (+14.2%)',
    location: 'Naivasha Escarpment → Eldoret Bypass',
    severity: 'CRITICAL',
    severityColor: 'bg-error-container text-on-error-container',
    timestamp: '2 hours ago',
    details:
      'CANBUS fuel flow meter registered 54.2 L/100km on the climb toward Mai Mahiu, which is 14.2% above the Actros 2640 loaded baseline (47.5 L/100km). Sensor logs show 3 extended idle stops with engine running.',
    impact: 'Estimated fuel excess cost: KES 8,400',
    actionText: 'Dispatch Driver Telemetry Debrief',
  },
  {
    id: 'anom-2',
    title: 'Shell Eldoret POS • Duplicate Transaction Detected',
    location: 'Paybill 247247 • Receipt QK829J25NB',
    severity: 'HIGH AUDIT',
    severityColor: 'bg-amber-100 text-amber-900',
    timestamp: 'Today 14:15 EAT',
    details:
      'Two identical charge requests of KES 18,500 were processed within a 300-second window. The pump attendant may have swiped twice or attempted split invoicing for secondary auxiliary fuel tanks.',
    impact: 'Risk exposure: KES 18,500 duplicate debit',
    actionText: 'Initiate Safaricom M-Pesa Reversal Request',
  },
  {
    id: 'anom-3',
    title: 'KCJ 312L • Missing Fiscal ETR Tax Receipt',
    location: 'Equator Tyres & Alignment - Nakuru Section 58',
    severity: 'KRA COMPLIANCE',
    severityColor: 'bg-purple-100 text-purple-900',
    timestamp: '3 hours ago',
    details:
      'A cash float expense of KES 48,000 for emergency Bridgestone 315/80R tyre replacement was submitted without an attached KRA TIMS fiscalized receipt. Statutory deductibility requires a valid QR code.',
    impact: 'Risk: Disallowance under KRA Section 23',
    actionText: 'Demand Merchant ETR Receipt',
  },
];

export const AnomaliesScreen: React.FC<AnomaliesScreenProps> = ({
  anomalies = DEFAULT_ANOMALIES,
  onResolveAnomaly,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolve = (id: string, title: string) => {
    onResolveAnomaly(id, title);
    triggerToast(`Resolved and archived anomaly: ${title}`);
  };

  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-primary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md text-[13px]">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              Diagnostic & Audit Surveillance • Real-Time Northern Corridor Feed
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Anomalies & Engine Diagnostics
            </h1>
            <span className="font-label-code text-[11px] bg-error-container text-on-error-container font-bold px-2 py-0.5 rounded-full">
              {anomalies.length} Active Incidents
            </span>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Automated sensor surveillance detecting fuel siphon patterns, POS card double-swipes & compliance gaps.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {anomalies.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-[#dce9ff] text-outline font-body-sm shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-[40px] block mx-auto mb-2">
              verified
            </span>
            <div className="font-bold text-base text-slate-800">All Corridors Clear</div>
            <p className="mt-1">
              All corridor telemetry anomalies, duplicate transactions, and compliance alerts have been investigated and cleared!
            </p>
          </div>
        ) : (
          anomalies.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-space-lg border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start justify-between gap-4 transition-all hover:border-outline-variant"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-label-code text-[10px] font-bold px-2 py-0.5 rounded-full ${item.severityColor}`}
                  >
                    {item.severity}
                  </span>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-outline font-label-sm text-[12px]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {item.timestamp}
                  </span>
                </div>

                <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">
                  {item.details}
                </p>

                <div className="font-label-code text-[11px] font-semibold text-error bg-error-container/20 px-2.5 py-1 rounded-md inline-block">
                  {item.impact}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => handleResolve(item.id, item.title)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>{item.actionText}</span>
                </button>
                <button
                  onClick={() => handleResolve(item.id, item.title)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface font-body-sm text-[12px] font-semibold border border-[#dce9ff] transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">archive</span>
                  <span>Dismiss & Log Note</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
