import React, { useState } from 'react';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [fileSelected, setFileSelected] = useState<string | null>(
    'safaricom_till_statement_sept2025.csv'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleRunPipeline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportComplete(18);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-background/50 backdrop-blur-sm"
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
                Statement CSV Ingestion & Column Mapper
              </span>
              <p className="font-label-sm text-[11px] text-outline">
                Safaricom Daraja / KCB / Equity Bulk Export Feed
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
                  {fileSelected}
                </div>
                <div className="font-label-code text-[11px] text-outline">
                  184 KB • 18 unmapped transactions detected
                </div>
              </div>
            </div>
            <label className="text-[12px] text-primary font-semibold cursor-pointer hover:underline">
              Replace
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileSelected(e.target.files[0].name);
                  }
                }}
              />
            </label>
          </div>

          {/* Auto-detected column mappings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                Auto-Detected Column Alignments
              </span>
              <span className="font-label-code text-[10px] text-tertiary bg-emerald-50 px-2 py-0.5 rounded font-bold">
                100% Schema Confidence
              </span>
            </div>

            <div className="space-y-2 text-body-sm text-[12px]">
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Receipt No / Trans ID</span>
                <span className="font-label-code font-bold text-on-surface">Column A (e.g. QK829J21NA)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Completion Time</span>
                <span className="font-label-code font-bold text-on-surface">Column B (ISO 8601 EAT)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Details / Merchant Info</span>
                <span className="font-label-code font-bold text-on-surface">Column C (Shell Eldoret Paybill)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant font-medium">Paid In / Out (KES)</span>
                <span className="font-label-code font-bold text-on-surface">Column E (Numeric)</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-2 border-t border-[#e5eeff]">
            <label className="flex items-center gap-2 text-body-sm text-[12px] text-on-surface cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
              <span>Ignore previously settled transactions (Deduplicate via Ref Code)</span>
            </label>
            <label className="flex items-center gap-2 text-body-sm text-[12px] text-on-surface cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
              <span>Auto-link Fleet Plate numbers detected in Account Reference fields</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-end gap-2 border-t border-[#e5eeff]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-body-md text-[13px] hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRunPipeline}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-body-md text-[13px] font-medium hover:bg-primary-container shadow-sm transition-all flex items-center gap-2 disabled:opacity-75"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Ingesting Feed...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Run Pipeline & Match</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
