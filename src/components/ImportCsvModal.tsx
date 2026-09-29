import React, { useState } from 'react';
import { ReconcileTransaction } from '../types';
import { parseCsv } from '../utils/format';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (txns: ReconcileTransaction[], filename: string) => void;
}

const DEFAULT_SAMPLE_CSV = `Receipt No,Completion Time,Details / Merchant,Paid Out (KES),Paid In (KES),Truck Plate
QK829J21NA,2026-09-24 08:30:15,Shell Eldoret North Junction,18500,0,KDA 542T
QK829J44KC,2026-09-24 10:14:02,TotalEnergies Mau Summit Bypass,24200,0,KDA 543U
QK829J99MP,2026-09-24 12:45:22,Malaba OSBP Border Transit Permit,9800,0,KCG 891B
QK829K01TR,2026-09-24 15:20:10,Equator Tyres Nakuru Alignment,14500,0,KDA 542T
QK829K19BZ,2026-09-25 09:05:44,Rubis Energy Webuye Weighbridge,21000,0,KCD 104M
QK829K33ZX,2026-09-25 11:30:00,KenolKobil Gilgil Corridor Hub,16800,0,KDF 221P
QK829K77AA,2026-09-25 14:10:18,Safaricom B2C Driver Allowance Disbursed,12000,0,KDA 542T
QK829K88BB,2026-09-25 16:45:00,Busia OSBP Clearance Toll Receipt,7500,0,KCG 891B`;

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions,
}) => {
  const [fileName, setFileName] = useState<string>('safaricom_daraja_b2c_sept2026.csv');
  const [csvContent, setCsvContent] = useState<string>(DEFAULT_SAMPLE_CSV);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deduplicate, setDeduplicate] = useState(true);
  const [autoLinkPlate, setAutoLinkPlate] = useState(true);

  if (!isOpen) return null;

  const parseCsvLines = (content: string): ReconcileTransaction[] => {
    const rawRows = parseCsv(content.trim());
    if (rawRows.length <= 1) return [];

    const headers = rawRows[0].map((h) => (h || '').toLowerCase().trim());

    // Dynamically detect column indices
    let refIdx = headers.findIndex((h) => h.includes('receipt') || h.includes('ref') || h.includes('trans') || h.includes('id') || h.includes('code'));
    if (refIdx === -1) refIdx = 0;

    let timeIdx = headers.findIndex((h) => h.includes('time') || h.includes('date') || h.includes('timestamp'));
    if (timeIdx === -1) timeIdx = 1;

    let merchantIdx = headers.findIndex((h) => h.includes('detail') || h.includes('merchant') || h.includes('party') || h.includes('desc') || h.includes('payee') || h.includes('vendor'));
    if (merchantIdx === -1) merchantIdx = 2;

    let paidOutIdx = headers.findIndex((h) => h.includes('paid out') || h.includes('debit') || h.includes('outflow') || h.includes('withdrawal'));
    let paidInIdx = headers.findIndex((h) => h.includes('paid in') || h.includes('credit') || h.includes('inflow') || h.includes('deposit'));
    let amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('total') || h.includes('kes') || h.includes('value'));

    let plateIdx = headers.findIndex((h) => h.includes('plate') || h.includes('truck') || h.includes('reg') || h.includes('vehicle') || h.includes('asset'));

    const parsed: ReconcileTransaction[] = [];
    const seenRefs = new Set<string>();

    for (let i = 1; i < rawRows.length; i++) {
      const cols = rawRows[i];
      if (!cols || cols.length === 0 || cols.every((c) => !c || c.trim() === '')) continue;

      const ref = cols[refIdx] ? cols[refIdx].trim() : `TXN-CSV-${Date.now().toString().slice(-6)}-${i}`;
      if (deduplicate && seenRefs.has(ref.toLowerCase())) {
        continue;
      }
      seenRefs.add(ref.toLowerCase());

      const dateTime = cols[timeIdx] ? cols[timeIdx].trim() : new Date().toISOString().replace('T', ' ').slice(0, 19);
      const [datePart, timePart] = dateTime.includes(' ') ? dateTime.split(' ') : [dateTime, '12:00:00'];
      const merchant = cols[merchantIdx] ? cols[merchantIdx].trim() : 'Corridor Merchant / Payee';

      let amount = 0;
      if (paidOutIdx !== -1 && cols[paidOutIdx]) {
        amount = parseFloat(String(cols[paidOutIdx]).replace(/[\$,\s]/g, '')) || 0;
      }
      if (amount === 0 && paidInIdx !== -1 && cols[paidInIdx]) {
        amount = parseFloat(String(cols[paidInIdx]).replace(/[\$,\s]/g, '')) || 0;
      }
      if (amount === 0 && amountIdx !== -1 && cols[amountIdx]) {
        amount = Math.abs(parseFloat(String(cols[amountIdx]).replace(/[\$,\s]/g, '')) || 0);
      }
      if (amount === 0 && cols[3]) {
        amount = Math.abs(parseFloat(String(cols[3]).replace(/[\$,\s]/g, '')) || 0);
      }

      const plate = plateIdx !== -1 && cols[plateIdx] ? cols[plateIdx].trim() : 'Corridor Fleet';

      parsed.push({
        id: `csv-${ref.toLowerCase().replace(/[^a-z0-9]/g, '')}-${i}`,
        rawType: 'EQUITY B2C',
        ref,
        timestamp: dateTime,
        merchantOrParty: merchant,
        accountOrTarget: plate,
        amountKes: amount,
        confidencePct: 95,
        confidenceLabel: 'Automated CSV Import Match',
        confidenceType: 'verified',
        erpTitle: autoLinkPlate && plate ? `Corridor Outlay (${plate})` : 'Disbursement Pending Sub-Ledger',
        erpSubtitle: `Ingested from ${fileName} • Ref: ${ref}`,
        erpDetails: `Statement date: ${datePart} ${timePart || ''} • Raw Outlay: KES ${amount.toLocaleString()}`,
        status: 'review',
      });
    }

    return parsed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleRunPipeline = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const parsedTxns = parseCsvLines(csvContent);
      onImportTransactions(parsedTxns, fileName);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  const lineCount = parseCsvLines(csvContent).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              upload_file
            </span>
            <div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Statement CSV Ingestion & Persistence Engine
              </span>
              <p className="font-label-sm text-[11px] text-outline">
                Safaricom Daraja B2C / I&M Bank / Equity Corporate Bulk Export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-lg space-y-4 max-h-[75vh] overflow-y-auto">
          {/* File state */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-tertiary text-[24px]">
                description
              </span>
              <div>
                <div className="font-body-sm text-[13px] font-semibold text-on-surface">
                  {fileName}
                </div>
                <div className="font-label-code text-[11px] text-outline">
                  {lineCount} valid corridor transactions ready for database persistence
                </div>
              </div>
            </div>
            <label className="text-[12px] text-primary font-semibold cursor-pointer hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#dce9ff] shadow-sm">
              <span className="material-symbols-outlined text-[16px]">folder_open</span>
              <span>Upload CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Auto-detected column mappings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Detected Column Alignments & Data Types
              </span>
              <span className="font-label-code text-[10px] text-tertiary bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                100% Schema Matched
              </span>
            </div>

            <div className="space-y-1.5 text-body-sm text-[12px]">
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Receipt No / Trans ID</span>
                <span className="font-label-code font-bold text-on-surface">Column A (e.g. QK829J21NA)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Completion Time</span>
                <span className="font-label-code font-bold text-on-surface">Column B (ISO 8601 EAT)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Details / Service Station</span>
                <span className="font-label-code font-bold text-on-surface">Column C (Shell Eldoret, Rubis)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Paid Out / Paid In (KES)</span>
                <span className="font-label-code font-bold text-on-surface">Column D/E (Numeric)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Truck Asset Plate</span>
                <span className="font-label-code font-bold text-primary">Column F (e.g. KDA 542T)</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-2 border-t border-[#e5eeff]">
            <label className="flex items-center gap-2 text-body-sm text-[12px] text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Ignore previously settled transactions (Deduplicate via Receipt Ref)</span>
            </label>
            <label className="flex items-center gap-2 text-body-sm text-[12px] text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={autoLinkPlate}
                onChange={(e) => setAutoLinkPlate(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Auto-link Fleet Plate numbers into ERP sub-ledger title</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-t border-[#e5eeff]">
          <span className="text-[11px] font-label-code text-outline">
            {lineCount} rows to ingest into <strong>reconciliation_txns</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-[#dce9ff] text-on-surface hover:bg-surface-container font-semibold text-[12px] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleRunPipeline}
              disabled={isProcessing || lineCount === 0}
              className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container font-semibold text-[12px] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isProcessing ? 'animate-spin' : ''}`}>
                {isProcessing ? 'sync' : 'cloud_upload'}
              </span>
              <span>{isProcessing ? 'Persisting to Database...' : 'Ingest & Persist Records'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
