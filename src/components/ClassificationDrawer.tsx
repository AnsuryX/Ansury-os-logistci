import React, { useState } from 'react';
import { ReconcileTransaction } from '../types';

interface ClassificationDrawerProps {
  transaction: ReconcileTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (txnId: string, category: string, vehicle: string, memo: string) => void;
}

export const ClassificationDrawer: React.FC<ClassificationDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('En-route Fleet Workshop Repair');
  const [selectedVehicle, setSelectedVehicle] = useState('KDA 542T (Mercedes Actros)');
  const [memo, setMemo] = useState('Urgent brake chamber & valve fix at Nakuru junction.');

  if (!isOpen || !transaction) return null;

  const categories = [
    { id: 'repair', name: 'En-route Fleet Workshop Repair', code: 'ACC-5020' },
    { id: 'fuel', name: 'Emergency Auxiliary Fuel Purchase', code: 'ACC-5010' },
    { id: 'toll', name: 'Unscheduled Weighbridge / Transit Fine', code: 'ACC-5035' },
    { id: 'draw', name: 'Director Personal Drawing (Non-Fleet)', code: 'ACC-3010' },
  ];

  const handleSave = () => {
    onSave(transaction.id, selectedCategory, selectedVehicle, memo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-space-lg bg-surface-container-low flex items-center justify-between border-b border-[#e5eeff]">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Fast Transaction Classifier
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-outline mt-0.5">
                Classify cash outflow & allocate to Fleet P&L ledger
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-space-lg space-y-4">
            {/* Raw Transaction Card */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-[#dce9ff]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-label-code text-[11px] text-outline block">
                    {transaction.ref} • {transaction.timestamp}
                  </span>
                  <div className="font-headline-sm text-[13px] font-semibold text-on-surface mt-0.5">
                    {transaction.merchantOrParty}
                  </div>
                </div>
                <div className="font-label-numeric text-[16px] font-bold text-on-surface">
                  KES {transaction.amountKes.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Target Account Radio Group */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-2">
                Classification & Account *
              </label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-surface-container-low border-[#dce9ff] hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="classificationCategory"
                      checked={selectedCategory === cat.name}
                      onChange={() => setSelectedCategory(cat.name)}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-body-sm text-[13px] font-semibold text-on-surface">
                        {cat.name}
                      </div>
                      <div className="font-label-code text-[11px] text-outline">
                        General Ledger: {cat.code}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Fleet Unit Selector */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Assign to Fleet Asset / Prime Mover
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-[#dce9ff]"
              >
                <option value="KDA 542T (Mercedes Actros)">KDA 542T • Mercedes Actros (NBO → KLA)</option>
                <option value="KDB 819M (Scania R480)">KDB 819M • Scania R480 (MOM → JIN)</option>
                <option value="KCB 190X (Isuzu Giga)">KCB 190X • Isuzu Giga (Local Shunting)</option>
                <option value="KDD 314A (Volvo FH16)">KDD 314A • Volvo FH16 (KIS → MAL)</option>
                <option value="Unassigned / Depot Pool">Unassigned / Nakuru Depot Overhead Pool</option>
              </select>
            </div>

            {/* Memo / Justification */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Voucher Justification Note
              </label>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-[#dce9ff] resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="p-space-md bg-surface-container-low flex items-center gap-space-sm border-t border-[#e5eeff]">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-[13px] hover:bg-surface-container transition-colors border border-[#dce9ff]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-body-md text-[13px] font-medium hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Save & Reconcile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
